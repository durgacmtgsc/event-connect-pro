import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const TWILIO_SID = Deno.env.get("TWILIO_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error("Twilio credentials not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const twilioAuth = btoa(`${TWILIO_SID}:${TWILIO_AUTH_TOKEN}`);

    // Fetch events that are scheduled and due
    const now = new Date().toISOString();
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .in("status", ["scheduled", "pending"])
      .lte("scheduled_time", now);

    if (eventsError) {
      throw eventsError;
    }

    console.log(`Found ${events?.length || 0} events to process`);

    const results = [];

    for (const event of events || []) {
      // Update event status to sending
      await supabase
        .from("events")
        .update({ status: "sending" })
        .eq("id", event.id);

      // Fetch pending contacts for this event
      const { data: contacts, error: contactsError } = await supabase
        .from("contacts")
        .select("*")
        .eq("event_id", event.id)
        .eq("status", "pending");

      if (contactsError) {
        console.error(`Error fetching contacts for event ${event.id}:`, contactsError);
        continue;
      }

      let sentCount = 0;
      let failedCount = 0;

      for (const contact of contacts || []) {
        try {
          let success = false;
          let errorMessage = null;

          if (event.mode === "SMS") {
            const formData = new URLSearchParams();
            formData.append("To", contact.phone);
            formData.append("From", TWILIO_PHONE_NUMBER);
            formData.append("Body", event.message);

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
            success = response.ok;
            if (!success) {
              errorMessage = result.message || "Failed to send SMS";
            }
          } else if (event.mode === "WHATSAPP") {
            const formData = new URLSearchParams();
            formData.append("To", `whatsapp:${contact.phone}`);
            formData.append("From", `whatsapp:${TWILIO_PHONE_NUMBER}`);
            formData.append("Body", event.message);

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
            success = response.ok;
            if (!success) {
              errorMessage = result.message || "Failed to send WhatsApp message";
            }
          } else if (event.mode === "CALL") {
            const twiml = `<Response><Say voice="alice">${event.message}</Say></Response>`;
            
            const formData = new URLSearchParams();
            formData.append("To", contact.phone);
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

            const result = await response.json();
            success = response.ok;
            if (!success) {
              errorMessage = result.message || "Failed to make voice call";
            }
          }

          // Update contact status
          await supabase
            .from("contacts")
            .update({
              status: success ? "sent" : "failed",
              error_message: errorMessage,
              sent_at: success ? new Date().toISOString() : null,
            })
            .eq("id", contact.id);

          if (success) {
            sentCount++;
          } else {
            failedCount++;
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error(`Error processing contact ${contact.id}:`, error);
          
          await supabase
            .from("contacts")
            .update({
              status: "failed",
              error_message: errorMessage,
            })
            .eq("id", contact.id);
          
          failedCount++;
        }
      }

      // Update event status and counts
      const totalContacts = (contacts?.length || 0);
      const finalStatus = failedCount === 0 ? "sent" : sentCount === 0 ? "failed" : "partial";

      await supabase
        .from("events")
        .update({
          status: finalStatus,
          sent_count: sentCount,
          failed_count: failedCount,
        })
        .eq("id", event.id);

      results.push({
        eventId: event.id,
        title: event.title,
        totalContacts,
        sentCount,
        failedCount,
        status: finalStatus,
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: events?.length || 0,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing scheduled events:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
