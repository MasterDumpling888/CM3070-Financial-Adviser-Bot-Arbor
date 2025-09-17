'use client';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from '@/components/ai-elements/prompt-input';
import { VoiceInputButton } from '@/components/ai-elements/voice2speech';
import { useState, useEffect } from 'react';
import { Response } from '@/components/ai-elements/response';
import { FinancialTerm } from '@/components/ai-elements/financial-term';
import { Loader } from '@/components/ai-elements/loader';
import { Card } from '@/components/ai-elements/card';
import { WatchlistCard } from '@/components/ai-elements/watchlist-card';
import { useAuth } from '@/components/ai-elements/auth';
import { useChat } from '@/context/ChatContext';

interface ChatHistoryItem {
  sender: 'user' | 'bot';
  message: string;
}

interface WatchlistItem {
  ticker: string;
  name: string;
  price: number;
  change: number;
  error?: string;
}



interface CardData {
  ticker: string;
  name: string;
  recommendation: {
    action: string;
    summary: string | FinancialTermParts;
    action_tags: string[];
  };
  prediction_date: string;
  analysis: {
    pros: (string | FinancialTermParts)[];
    cons: (string | FinancialTermParts)[];
  };
  data: {
    close_price: number;
    volume: number;
    technical_indicators: {
      macd: number;
      rsi_30: number;
      cci_30: number;
      boll_ub: number;
      boll_lb: number;
      dx_30: number;
      close_30_sma: number;
      close_60_sma: number;
    };
  };
}

type ChatCard = CardData | WatchlistItem;

interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  error?: string;
}

interface MessagePart {
  type: 'text' | 'card' | 'watchlist_card';
  text?: string;
  content?: ChatCard;
}

interface MessageItem {
  id: string;
  role: 'user' | 'is-assistant';
  parts: MessagePart[];
}

const ChatPage = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<StockData | null>(null);
  const { currentConversationId, isNewChat, setIsNewChat } = useChat();

  const { user } = useAuth();

  useEffect(() => {
    setSelectedCard(null);
  }, [currentConversationId]);

  useEffect(() => {
    const loadChatHistory = async () => {
      if (user && currentConversationId) {
        try {
          const response = await fetch(
            `http://localhost:8000/chat_history/${user.uid}/${currentConversationId}`
          );
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          const formattedMessages = data.chat_history.map((item: ChatHistoryItem, index: number) => {
            if (item.sender === 'bot') {
              try {
                const parsedMessage = JSON.parse(item.message);
                const chatMessages = parsedMessage.chat_messages.map((msg: string, i: number) => ({
                  id: `${index}-${i}-bot`,
                  role: 'is-assistant',
                  parts: [{ type: 'text', text: msg }],
                }));

                const cards = parsedMessage.cards || [];
                const cardType = cards.length > 1 ? 'watchlist_card' : 'card';

                const cardMessages = cards.map((card: ChatCard, i: number) => ({
                  id: `${index}-${i}-card`,
                  role: 'is-assistant',
                  parts: [{ type: cardType, content: card }],
                }));
                return [...chatMessages, ...cardMessages];
              } catch (e) {
                return {
                  id: `${index}-bot-error`,
                  role: 'is-assistant',
                  parts: [{ type: 'text', text: item.message }],
                };
              }
            } else {
              return {
                id: `${index}-user`,
                role: 'user',
                parts: [{ type: 'text', text: item.message }],
              };
            }
          }).flat();
          setMessages(formattedMessages);
        } catch (error) {
          console.error('Error fetching chat history:', error);
        }
      } else {
        setMessages([]);
      }
    };

    if (user) {
      loadChatHistory();
    }
  }, [user, currentConversationId]);

  const handleTranscription = (text: string) => {
    setInput(text);
  };

  const handleCardSelect = (card: StockData) => {
    if (selectedCard && selectedCard.ticker === card.ticker) {
      setSelectedCard(null);
    }
    else {
      setSelectedCard(card);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setSelectedCard(null);
      const newMessage: MessageItem = {
        id: `user-${Date.now()}`,
        role: 'user',
        parts: [{ type: 'text', text: input }],
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput('');
      setIsLoading(true);

      const payload = {
        user_message: input,
        user_id: user ? user.uid : null,
        conversation_id: user ? currentConversationId : null,
        is_new_chat: isNewChat,
      };

      try {
        const response = await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (isNewChat) {
          setIsNewChat(false);
        }

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        let parsedBotMessage;
        try {
          parsedBotMessage = JSON.parse(data.bot_message);
        } catch (e) {
          const errorMessage: MessageItem = {
            id: `error-${Date.now()}`,
            role: 'is-assistant',
            parts: [{ type: 'text', text: data.bot_message }],
          };
          setMessages((prevMessages) => [...prevMessages, errorMessage]);
          setIsLoading(false);
          return;
        }

        const botMessages = parsedBotMessage.chat_messages.map((message: string, i: number) => ({
          id: `bot-${Date.now()}-${i}`,
          role: 'is-assistant',
          parts: [{ type: 'text', text: message }],
        }));

        const cards = parsedBotMessage.cards || [];
        const cardType = cards.length > 1 ? 'watchlist_card' : 'card';

        const cardMessages = cards.map((card: ChatCard, i: number) => ({
          id: `card-${Date.now()}-${i}`,
          role: 'is-assistant',
          parts: [{ type: cardType, content: card }],
        }));

        setMessages((prevMessages) => [...prevMessages, ...botMessages, ...cardMessages]);
      } catch (error) {
        console.error('Error fetching data:', error);
        const errorMessage: MessageItem = {
          id: `error-${Date.now()}`,
          role: 'is-assistant',
          parts: [
            {
              type: 'text',
              text: 'Sorry, something went wrong. Please try again.',
            },
          ],
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 max-w-4xl mx-auto relative size-full">
        <div className="flex flex-col h-full">
          <Conversation className="flex-1 overflow-y-auto scrollbar-hide conversation">
            <ConversationContent>
              {messages.map((message) => (
                <Message from={message.role} key={message.id} className={message.role === 'user' ? 'message user': 'message bot'}>
                  <MessageContent className='message-content'>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          if (message.role === 'is-assistant') {
                            try {
                              const parts = typeof part.text === 'string' ? JSON.parse(part.text) : part.text;
                              return <FinancialTerm key={`${message.id}-${i}`} parts={parts}/>;
                            } catch (e) {
                              return <Response key={`${message.id}-${i}`} className=''>{part.text}</Response>;
                            }
                          }
                          return (
                            <Response key={`${message.id}-${i}`} className=''>
                              {part.text}
                            </Response>
                          );
                        case 'card':
                          if (!part.content || !('recommendation' in part.content)) return null; // Add this check
                          return <Card key={`${message.id}-${i}`} card={part.content} isCollapsible={false} onCollapse={() => setSelectedCard(null)}/>;
                        case 'watchlist_card':
                          if (selectedCard && part.content && selectedCard.ticker === part.content.ticker) {
                            if ('recommendation' in part.content) { // Check if it's a CardData
                              return <Card key={`${message.id}-${i}`} card={part.content} isCollapsible={true} onCollapse={() => setSelectedCard(null)} />;
                            }
                          }
                          return (
                            <WatchlistCard
                              key={`${message.id}-${i}`}
                              card={part.content}
                              onSelect={handleCardSelect}
                              index={i}
                            />
                          );
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                </Message>
              ))}
              {isLoading && <Loader />}
            </ConversationContent>
            <ConversationScrollButton className='bg-accent' />
          </Conversation>
          <div className='prompt-input'>
            <PromptInput onSubmit={handleSubmit} className="b-5 border-none flex flex-row">
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
              />
              <PromptInputToolbar className='flex'>
                  <VoiceInputButton onTranscription={handleTranscription}/>
                  <PromptInputSubmit disabled={!input || isLoading} className='submit'/>
              </PromptInputToolbar>
            </PromptInput>
              <p className='text-secondary-foreground'>Arbor can make mistakes. Please check responses</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
