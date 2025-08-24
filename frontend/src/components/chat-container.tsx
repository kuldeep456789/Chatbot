import React, { useState } from "react";
import { ChatInput } from "./chat-input";
import { useChatContext } from "stream-chat-react"; // correct hook

export const ChatContainer: React.FC = () => {
  const [value, setValue] = useState("");
  const { channel } = useChatContext(); // get current channel from context

  const sendMessage = async (message: { text: string }) => {
    if (!channel || !message.text.trim()) return;

    try {
      await channel.sendMessage({
        text: message.text,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <ChatInput
      value={value}
      onValueChange={setValue}
      sendMessage={sendMessage}
      isGenerating={false}
      showPromptToolbar
    />
  );
};
