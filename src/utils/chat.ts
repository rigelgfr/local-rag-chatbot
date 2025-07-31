export const sendChatMessage = async (sessionId: string, chatInput: string) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId,
      chatInput,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(
      errorBody?.error || "Failed to get response"
    ) as Error & {
      status?: number;
      retryAfter?: string | null;
    };
    error.status = response.status;
    error.retryAfter = response.headers.get("Retry-After");
    throw error;
  }

  const data = await response.json();

  let outputText = "";
  if (Array.isArray(data) && data.length > 0 && data[0].output) {
    outputText = data[0].output;
  } else if (data.output) {
    outputText = data.output;
  } else {
    outputText = "Sorry, I could not generate a response.";
  }

  return outputText;
};
