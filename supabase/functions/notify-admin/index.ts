import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// HTML escape function to prevent injection attacks
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const TWILIO_SID = Deno.env.get("TWILIO_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

const ADMIN_EMAIL = "info@eventreach.in";
const ADMIN_PHONE = "+918897105036";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface NotifyRequest {
  type: "contact" | "slot_purchase";
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  message?: string;
  slotPackage?: string;
  slotCount?: number;
}

interface NotificationResult {
  channel: string;
  success: boolean;
  error?: string;
  skipped?: boolean;
  response?: unknown;
}

function logInfo(message: string, data?: unknown) {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data) : '');
}

function logError(message: string, error?: unknown) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error ? JSON.stringify(error) : '');
}

function logWarn(message: string, data?: unknown) {
  console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data) : '');
}

async function sendEmail(to: string, subject: string, html: string): Promise<NotificationResult> {
  const channel = `email:${to}`;
  
  if (!RESEND_API_KEY) {
    logWarn("RESEND_API_KEY not configured, skipping email", { to, subject });
    return { channel, success: false, skipped: true, error: "RESEND_API_KEY not configured" };
  }

  try {
    logInfo("Sending email", { to, subject });
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "EventReach <noreply@eventreach.in>",
        to: [to],
        subject,
        html,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      logError("Resend API error", { status: response.status, response: responseData });
      return { channel, success: false, error: responseData?.message || `HTTP ${response.status}` };
    }

    logInfo("Email sent successfully", { to, subject, id: responseData?.id });
    return { channel, success: true, response: responseData };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logError("Email send exception", { to, error: errorMessage });
    return { channel, success: false, error: errorMessage };
  }
}

async function sendSMS(to: string, body: string): Promise<NotificationResult> {
  const channel = `sms:${to}`;
  
  if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    logWarn("Twilio credentials not configured, skipping SMS", { to });
    return { channel, success: false, skipped: true, error: "Twilio credentials not configured" };
  }

  try {
    logInfo("Sending SMS", { to, bodyLength: body.length });
    
    const twilioAuth = btoa(`${TWILIO_SID}:${TWILIO_AUTH_TOKEN}`);
    const formData = new URLSearchParams();
    formData.append("To", to);
    formData.append("From", TWILIO_PHONE_NUMBER);
    formData.append("Body", body);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${twilioAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      logError("Twilio API error", { status: response.status, result });
      return { channel, success: false, error: result?.message || `HTTP ${response.status}` };
    }

    logInfo("SMS sent successfully", { to, sid: result?.sid, status: result?.status });
    return { channel, success: true, response: { sid: result?.sid, status: result?.status } };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logError("SMS send exception", { to, error: errorMessage });
    return { channel, success: false, error: errorMessage };
  }
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID().slice(0, 8);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  logInfo(`[${requestId}] Incoming notification request`, { method: req.method });

  try {
    const data: NotifyRequest = await req.json();
    const { type, customerName, customerPhone, customerEmail, message, slotPackage, slotCount } = data;

    logInfo(`[${requestId}] Processing notification`, { 
      type, 
      customerName, 
      customerPhone: customerPhone?.slice(0, 6) + "****", 
      hasEmail: !!customerEmail,
      slotPackage 
    });

    // Validate required fields
    if (!customerName || !customerPhone) {
      logError(`[${requestId}] Missing required fields`, { customerName: !!customerName, customerPhone: !!customerPhone });
      return new Response(
        JSON.stringify({ error: "Missing required fields: customerName, customerPhone" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!type || !["contact", "slot_purchase"].includes(type)) {
      logError(`[${requestId}] Invalid notification type`, { type });
      return new Response(
        JSON.stringify({ error: "Invalid type. Must be 'contact' or 'slot_purchase'" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate input lengths to prevent abuse
    if (customerName.length > 100) {
      logError(`[${requestId}] Customer name too long`, { length: customerName.length });
      return new Response(
        JSON.stringify({ error: "Customer name must be less than 100 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (customerPhone.length > 20) {
      logError(`[${requestId}] Customer phone too long`, { length: customerPhone.length });
      return new Response(
        JSON.stringify({ error: "Phone number must be less than 20 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (message && message.length > 1000) {
      logError(`[${requestId}] Message too long`, { length: message.length });
      return new Response(
        JSON.stringify({ error: "Message must be less than 1000 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (customerEmail && customerEmail.length > 255) {
      logError(`[${requestId}] Customer email too long`, { length: customerEmail.length });
      return new Response(
        JSON.stringify({ error: "Email must be less than 255 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // HTML-escape user inputs for email templates
    const safeCustomerName = escapeHtml(customerName);
    const safeCustomerPhone = escapeHtml(customerPhone);
    const safeCustomerEmail = customerEmail ? escapeHtml(customerEmail) : undefined;
    const safeMessage = message ? escapeHtml(message) : undefined;
    const safeSlotPackage = slotPackage ? escapeHtml(slotPackage) : undefined;

    const results: NotificationResult[] = [];

    if (type === "contact") {
      logInfo(`[${requestId}] Processing contact inquiry notification`);
      
      // Admin notification for contact inquiry (SMS uses plain text, no escaping needed)
      const adminSmsText = `New contact inquiry:\nName: ${customerName}\nPhone: ${customerPhone}\nMessage: ${message || "No message"}`.slice(0, 1600);
      
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">New Contact Inquiry - EventReach</h2>
          <hr style="border: 1px solid #eee;" />
          <p><strong>Name:</strong> ${safeCustomerName}</p>
          <p><strong>Phone:</strong> <a href="tel:${safeCustomerPhone}">${safeCustomerPhone}</a></p>
          ${safeCustomerEmail ? `<p><strong>Email:</strong> <a href="mailto:${safeCustomerEmail}">${safeCustomerEmail}</a></p>` : ""}
          <h3 style="color: #555; margin-top: 20px;">Message:</h3>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p style="white-space: pre-wrap;">${safeMessage || "No message provided"}</p>
          </div>
          <hr style="border: 1px solid #eee; margin-top: 30px;" />
          <p style="color: #888; font-size: 12px;">EventReach - Event Invitation Platform</p>
        </div>
      `;

      const [emailResult, smsResult] = await Promise.all([
        sendEmail(ADMIN_EMAIL, `New Contact Inquiry from ${safeCustomerName}`, adminEmailHtml),
        sendSMS(ADMIN_PHONE, adminSmsText)
      ]);
      
      results.push({ ...emailResult, channel: "admin_email" });
      results.push({ ...smsResult, channel: "admin_sms" });

    } else if (type === "slot_purchase") {
      logInfo(`[${requestId}] Processing slot purchase notification`, { slotPackage, slotCount });
      
      // Admin notification for slot purchase (SMS uses plain text)
      const adminSmsText = `New slot booking request:\nName: ${customerName}\nPhone: ${customerPhone}\nPackage: ${slotPackage || slotCount + " guests"}`.slice(0, 1600);
      
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">New Slot Booking Request - EventReach</h2>
          <hr style="border: 1px solid #eee;" />
          <p><strong>Customer Name:</strong> ${safeCustomerName}</p>
          <p><strong>Phone:</strong> <a href="tel:${safeCustomerPhone}">${safeCustomerPhone}</a></p>
          ${safeCustomerEmail ? `<p><strong>Email:</strong> <a href="mailto:${safeCustomerEmail}">${safeCustomerEmail}</a></p>` : ""}
          <div style="background: #e0e7ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Package:</strong> ${safeSlotPackage || slotCount + " guests"}</p>
          </div>
          <p style="color: #666;">Please contact the customer to complete their booking.</p>
          <hr style="border: 1px solid #eee; margin-top: 30px;" />
          <p style="color: #888; font-size: 12px;">EventReach - Event Invitation Platform</p>
        </div>
      `;

      // Send admin notifications in parallel
      const [adminEmailResult, adminSmsResult] = await Promise.all([
        sendEmail(ADMIN_EMAIL, `New Slot Booking Request: ${safeSlotPackage || slotCount + " guests"}`, adminEmailHtml),
        sendSMS(ADMIN_PHONE, adminSmsText)
      ]);
      
      results.push({ ...adminEmailResult, channel: "admin_email" });
      results.push({ ...adminSmsResult, channel: "admin_sms" });

      // Customer confirmation
      const customerSmsText = `Thank you for your booking request with EventReach – ${slotPackage || slotCount + " guest"} package. Our team will contact you shortly to confirm your booking.`.slice(0, 1600);
      
      // Send customer notifications
      const customerNotifications: Promise<NotificationResult>[] = [];
      
      if (customerPhone) {
        customerNotifications.push(sendSMS(customerPhone, customerSmsText));
      }

      if (customerEmail) {
        const customerEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Booking Request Received - EventReach</h2>
            <p>Dear ${safeCustomerName},</p>
            <p>Thank you for your booking request with EventReach – <strong>${safeSlotPackage || slotCount + " guests"}</strong> package.</p>
            <p>Our team will contact you shortly to confirm your booking and help you get started with your event invitations.</p>
            <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #4f46e5;">Your Package: ${safeSlotPackage || slotCount + " guests"}</p>
            </div>
            <p>Need immediate assistance? Contact us:</p>
            <ul>
              <li>📞 Call: <a href="tel:+918897105036">+91 88971 05036</a></li>
              <li>💬 WhatsApp: <a href="https://wa.me/918897105036">Chat with us</a></li>
              <li>📧 Email: <a href="mailto:info@eventreach.in">info@eventreach.in</a></li>
            </ul>
            <hr style="border: 1px solid #eee; margin-top: 30px;" />
            <p style="color: #888; font-size: 12px;">EventReach - Making Every Invitation Special</p>
          </div>
        `;
        customerNotifications.push(sendEmail(customerEmail, "Booking Request Received - EventReach", customerEmailHtml));
      }

      const customerResults = await Promise.all(customerNotifications);
      customerResults.forEach((result, index) => {
        results.push({ ...result, channel: index === 0 ? "customer_sms" : "customer_email" });
      });
    }

    // Log summary
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success && !r.skipped).length;
    const skippedCount = results.filter(r => r.skipped).length;

    logInfo(`[${requestId}] Notification summary`, { 
      type,
      total: results.length, 
      success: successCount, 
      failed: failedCount, 
      skipped: skippedCount,
      results: results.map(r => ({ channel: r.channel, success: r.success, skipped: r.skipped, error: r.error }))
    });

    // Determine overall success - at least admin email or SMS should succeed
    const adminNotificationSent = results.some(r => 
      (r.channel === "admin_email" || r.channel === "admin_sms") && r.success
    );

    if (!adminNotificationSent && failedCount > 0) {
      logError(`[${requestId}] No admin notifications were sent successfully`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        requestId,
        summary: {
          total: results.length,
          success: successCount,
          failed: failedCount,
          skipped: skippedCount,
          adminNotified: adminNotificationSent
        },
        results 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logError(`[${requestId}] Fatal error in notify-admin function`, { error: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    return new Response(
      JSON.stringify({ error: errorMessage, requestId }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
