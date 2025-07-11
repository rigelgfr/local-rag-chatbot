import { NextRequest, NextResponse } from "next/server";

// Configuration - Update these values for your n8n setup
const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/chat";
const N8N_BEARER_TOKEN =
  process.env.N8N_BEARER_TOKEN || "your-hardcoded-bearer-token";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, chatInput } = body;

    // Validate required fields
    if (!sessionId || !chatInput) {
      return NextResponse.json(
        { error: "sessionId and chatInput are required" },
        { status: 400 }
      );
    }

    console.log("Sending to n8n:", { sessionId, chatInput });

    // Send request to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${N8N_BEARER_TOKEN}`,
      },
      body: JSON.stringify({
        sessionId,
        chatInput,
      }),
    });

    if (!response.ok) {
      console.error("n8n webhook error:", response.status, response.statusText);
      const errorText = await response.text();
      console.error("n8n error response:", errorText);
      return NextResponse.json(
        { error: "Failed to get response from AI service" },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("n8n response:", JSON.stringify(data, null, 2));

    // Handle different response structures
    let output = "";
    if (Array.isArray(data) && data.length > 0) {
      // n8n returns an array, get the first item's output
      const firstItem = data[0];
      if (firstItem.output) {
        output = firstItem.output;
      } else {
        console.error("First array item has no output field:", firstItem);
        output =
          "I received your message but the response format was unexpected.";
      }
    } else if (data.output) {
      output = data.output;
    } else if (data.message) {
      output = data.message;
    } else if (data.response) {
      output = data.response;
    } else {
      console.error("Unexpected n8n response structure:", data);
      output =
        "I received your message but had trouble processing the response format.";
    }

    // Return the response in the expected format
    return NextResponse.json({ output });
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
