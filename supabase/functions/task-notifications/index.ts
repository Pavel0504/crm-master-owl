import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TaskNotificationPayload {
  type: string;
  table: string;
  record: {
    id: string;
    title: string;
    assigned_to: string | null;
    deadline: string | null;
  };
  old_record?: {
    assigned_to: string | null;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: TaskNotificationPayload = await req.json();

    const isAssigned = payload.record.assigned_to &&
                       (!payload.old_record || payload.old_record.assigned_to !== payload.record.assigned_to);

    if (isAssigned) {
      console.log(`Task "${payload.record.title}" assigned to user ${payload.record.assigned_to}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification processed",
        assigned: isAssigned
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing task notification:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
