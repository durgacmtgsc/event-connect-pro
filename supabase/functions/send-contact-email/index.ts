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
const RESEND_API_URL = "https://api.resend.com/emails";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

async function sendEmail(to: string[], from: string, subject: string, html: string, replyTo?: string) {
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      reply_to: replyTo,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return response.json();
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { name, email, phone, message }: ContactRequest = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      throw new Error("Missing required fields: name, email, and message are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }

    // Validate lengths
    if (name.length > 100) throw new Error("Name must be less than 100 characters");
    if (email.length > 255) throw new Error("Email must be less than 255 characters");
    if (phone && phone.length > 20) throw new Error("Phone must be less than 20 characters");
    if (message.length > 1000) throw new Error("Message must be less than 1000 characters");

    const toEmail = Deno.env.get("CONTACT_EMAIL") || "info@eventconnect.com";
    const fromDomain = Deno.env.get("RESEND_FROM_DOMAIN") || "eventconnect.com";

    // HTML-escape user inputs for email templates
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = phone ? escapeHtml(phone) : undefined;
    const safeMessage = escapeHtml(message);

    // Send notification email to admin
    const emailResponse = await sendEmail(
      [toEmail],
      `EventConnect Pro <noreply@${fromDomain}>`,
      `New Contact Inquiry from ${safeName}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <hr style="border: 1px solid #eee;" />
          
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ""}
          
          <h3 style="color: #555; margin-top: 20px;">Message:</h3>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p style="white-space: pre-wrap;">${safeMessage}</p>
          </div>
          
          <hr style="border: 1px solid #eee; margin-top: 30px;" />
          <p style="color: #888; font-size: 12px;">
            This email was sent from the EventConnect Pro contact form.
          </p>
        </div>
      `,
      email
    );

    // Send confirmation email to user
    await sendEmail(
      [email],
      `EventConnect Pro <noreply@${fromDomain}>`,
      "We received your message!",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for reaching out, ${safeName}!</h2>
          
          <p>We've received your message and will get back to you within 24 hours.</p>
          
          <h3 style="color: #555; margin-top: 20px;">Your message:</h3>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <p style="white-space: pre-wrap;">${safeMessage}</p>
          </div>
          
          <p style="margin-top: 20px;">
            In the meantime, feel free to book a demo slot directly on our website.
          </p>
          
          <hr style="border: 1px solid #eee; margin-top: 30px;" />
          <p style="color: #888; font-size: 12px;">
            EventConnect Pro - Schedule and send SMS, WhatsApp messages, and voice calls with ease
          </p>
        </div>
      `
    );

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
