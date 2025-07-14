export const sendChatMessage = async (sessionId: string, chatInput: string) => {
  const response = await fetch("/api/test", {
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
    throw new Error("Failed to get response");
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
