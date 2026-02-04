import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return { skipped: true };
  }

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

  if (!response.ok) {
    const error = await response.text();
    console.error("Resend API error:", error);
    return { error };
  }

  return response.json();
}

async function sendSMS(to: string, body: string) {
  if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log("Twilio credentials not configured, skipping SMS");
    return { skipped: true };
  }

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
    console.error("Twilio API error:", result);
    return { error: result.message || "SMS send failed" };
  }

  return result;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: NotifyRequest = await req.json();
    const { type, customerName, customerPhone, customerEmail, message, slotPackage, slotCount } = data;

    // Validate required fields
    if (!customerName || !customerPhone) {
      throw new Error("Missing required fields: customerName, customerPhone");
    }

    const results: Record<string, unknown> = {};

    if (type === "contact") {
      // Admin notification for contact inquiry
      const adminSmsText = `New contact inquiry:\nName: ${customerName}\nPhone: ${customerPhone}\nMessage: ${message || "No message"}`;
      
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">New Contact Inquiry - EventReach</h2>
          <hr style="border: 1px solid #eee;" />
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Phone:</strong> <a href="tel:${customerPhone}">${customerPhone}</a></p>
          ${customerEmail ? `<p><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></p>` : ""}
          <h3 style="color: #555; margin-top: 20px;">Message:</h3>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p style="white-space: pre-wrap;">${message || "No message provided"}</p>
          </div>
          <hr style="border: 1px solid #eee; margin-top: 30px;" />
          <p style="color: #888; font-size: 12px;">EventReach - Event Invitation Platform</p>
        </div>
      `;

      results.adminEmail = await sendEmail(ADMIN_EMAIL, `New Contact Inquiry from ${customerName}`, adminEmailHtml);
      results.adminSms = await sendSMS(ADMIN_PHONE, adminSmsText);

    } else if (type === "slot_purchase") {
      // Admin notification for slot purchase
      const adminSmsText = `New slot purchase:\nName: ${customerName}\nPhone: ${customerPhone}\nPackage: ${slotPackage || slotCount + " guests"}`;
      
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">New Slot Purchase - EventReach</h2>
          <hr style="border: 1px solid #eee;" />
          <p><strong>Customer Name:</strong> ${customerName}</p>
          <p><strong>Phone:</strong> <a href="tel:${customerPhone}">${customerPhone}</a></p>
          ${customerEmail ? `<p><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></p>` : ""}
          <div style="background: #e0e7ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Package:</strong> ${slotPackage || slotCount + " guests"}</p>
          </div>
          <p style="color: #666;">Please contact the customer to complete their booking.</p>
          <hr style="border: 1px solid #eee; margin-top: 30px;" />
          <p style="color: #888; font-size: 12px;">EventReach - Event Invitation Platform</p>
        </div>
      `;

      results.adminEmail = await sendEmail(ADMIN_EMAIL, `New Slot Purchase: ${slotPackage}`, adminEmailHtml);
      results.adminSms = await sendSMS(ADMIN_PHONE, adminSmsText);

      // Customer confirmation
      const customerSmsText = `Thank you for booking EventReach – ${slotPackage || slotCount + " guest"} package. Our team will contact you shortly.`;
      
      if (customerPhone) {
        results.customerSms = await sendSMS(customerPhone, customerSmsText);
      }

      if (customerEmail) {
        const customerEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Booking Confirmed - EventReach</h2>
            <p>Dear ${customerName},</p>
            <p>Thank you for booking EventReach – <strong>${slotPackage}</strong> package.</p>
            <p>Our team will contact you shortly to complete your booking and help you get started with your event invitations.</p>
            <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #4f46e5;">Your Package: ${slotPackage}</p>
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
        results.customerEmail = await sendEmail(customerEmail, "Booking Confirmed - EventReach", customerEmailHtml);
      }
    }

    console.log("Notifications sent:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in notify-admin function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
