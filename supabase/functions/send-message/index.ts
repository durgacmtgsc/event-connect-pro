import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendMessageRequest {
  contactId: string;
  phone: string;
  message: string;
  mode: "SMS" | "WHATSAPP" | "CALL";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TWILIO_SID = Deno.env.get("TWILIO_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error("Twilio credentials not configured");
    }

    const { contactId, phone, message, mode }: SendMessageRequest = await req.json();

    let result;
    const twilioAuth = btoa(`${TWILIO_SID}:${TWILIO_AUTH_TOKEN}`);

    if (mode === "SMS") {
      // Send SMS
      const formData = new URLSearchParams();
      formData.append("To", phone);
      formData.append("From", TWILIO_PHONE_NUMBER);
      formData.append("Body", message);

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

      result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to send SMS");
      }
    } else if (mode === "WHATSAPP") {
      // Send WhatsApp message
      const formData = new URLSearchParams();
      formData.append("To", `whatsapp:${phone}`);
      formData.append("From", `whatsapp:${TWILIO_PHONE_NUMBER}`);
      formData.append("Body", message);

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

      result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to send WhatsApp message");
      }
    } else if (mode === "CALL") {
      // Make voice call with TTS
      const twiml = `<Response><Say voice="alice">${message}</Say></Response>`;
      
      const formData = new URLSearchParams();
      formData.append("To", phone);
      formData.append("From", TWILIO_PHONE_NUMBER);
      formData.append("Twiml", twiml);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Calls.json`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${twilioAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to make voice call");
      }
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending message:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
