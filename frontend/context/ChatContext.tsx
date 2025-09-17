'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

const ChatContext = createContext<any>(null);

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversationCreated, setConversationCreated] = useState(false);

  const [isNewChat, setIsNewChat] = useState(false);

  const newChat = () => {
    const newConversationId = Date.now().toString();
    setCurrentConversationId(newConversationId);
    setConversationCreated(true);
    setIsNewChat(true);
  };

  return (
    <ChatContext.Provider value={{ currentConversationId, setCurrentConversationId, newChat, conversationCreated, setConversationCreated, isNewChat, setIsNewChat }}>
      {children}
    </ChatContext.Provider>
  );
};
