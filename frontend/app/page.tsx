'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/ai-elements/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChat } from '@/context/ChatContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChartAreaGradient } from '@/components/charts/area-chart-gradient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import StockMarketNews from '@/components/stock-market-news';
import { WatchlistItemCard } from '@/components/watchlist/WatchlistItemCard';

interface WatchlistItem {
  ticker: string;
  name: string;
  price: number;
  change: number;
  error?: string;
}

interface StockData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  error?: string;
  // Add other properties that might come from the backend if needed
}

interface ChatHistoryItem {
  id: string;
  title: string;
}

const AuthenticatedDashboard = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [averagePerformance, setAveragePerformance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const { newChat, setCurrentConversationId, conversationCreated } = useChat();
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const router = useRouter();

  const handleNewChat = () => {
    newChat();
    router.push('/chat');
  };

  const handleChatSelect = (chatId: string) => {
    setCurrentConversationId(chatId);
    router.push('/chat');
  };

  const handleDelete = async (ticker: string) => {
    if (user) {
      const docRef = doc(db, `users/${user.uid}/watchlist`, ticker);
      await deleteDoc(docRef);
      setWatchlist(watchlist.filter((item) => item.ticker !== ticker));
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      if (user) {
        try {
          const response = await fetch(`http://localhost:8000/conversations/${user.uid}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setChatHistory(data.conversations.slice(0, 3));
        } catch (error) {
          console.error('Error fetching conversations:', error);
        }
      }
    };

    fetchConversations();
  }, [user, conversationCreated]);

  useEffect(() => {
    if (user) {
      const fetchWatchlist = async () => {
        setIsLoading(true); // Set loading to true at the start
        try {
          const response = await fetch(`http://localhost:8000/watchlist/${user.uid}`);
          if (!response.ok) {
            console.error("Failed to fetch watchlist data:", response.statusText);
            setWatchlist([]);
            setAveragePerformance(0); // Reset average performance on error
            setIsLoading(false);
            return;
          }
          const data = await response.json();
          const enrichedWatchlist = data.watchlist.map((item: WatchlistItem) => ({
            ticker: item.ticker,
            name: item.name || item.ticker,
            price: item.price || 0,
            change: item.change || 0,
            error: item.error,
          }));
          setWatchlist(enrichedWatchlist);

          const validItems = enrichedWatchlist.filter((item: WatchlistItem) => !item.error);
          const totalPerformance = validItems.reduce((acc: number, item: WatchlistItem) => acc + item.change, 0);
          const avgPerformance = validItems.length > 0 ? totalPerformance / validItems.length : 0;
          setAveragePerformance(avgPerformance);

          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching watchlist data:", error);
          setWatchlist([]);
          setAveragePerformance(0); // Reset average performance on error
          setIsLoading(false);
        }
      };

      fetchWatchlist();
    }
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className=" mx-auto">
      <h1>Welcome back, {user?.username}</h1>
      <h3>Here&apos;s your summary for today</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-2 lg:grid-rows-2 gap-4">
        <Card className='card row-span-2'>
          <CardHeader className='card-header'>
            <CardTitle className='card-title text-center'>Chat with Arbor</CardTitle>
          </CardHeader>
          <CardContent className='card-content'>
            <Button onClick={handleNewChat} className='btn-primary w-full'>+ New Chat</Button>
            <div className="mt-8">
              {chatHistory.map((chat) => (
                <Button key={chat.id} onClick={() => handleChatSelect(chat.id)} className="btn bg-white  w-full mb-1">
                  <p className="text-sm font-semibold">{chat.title || `Chat ${chat.id}`}</p>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className='card row-span-2'>
          <CardHeader className='card-header'>
            <CardTitle className='card-title text-center'>Average Performance</CardTitle>
          </CardHeader>
          <CardContent className='flex justify-center p-0'>
            <div className={`avg-performance rounded-full w-32 h-32 lg:w-40 lg:h-40 justify-center text-center items-center ${averagePerformance >= 0 ? 'border-green-400': 'border-red-400'}` } >
              {averagePerformance.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <div className="md:col-span-2">
          <Card className='card'>
            <CardHeader className='card-header text-center'>
              <CardTitle className='card-title'>Your Watchlist</CardTitle>
            </CardHeader>
            <CardContent className='card-content'>
              <div>
                {watchlist.map((stock, index) => (
                  <WatchlistItemCard
                    key={stock.ticker}
                    stock={stock}
                    onClick={(stock) => setSelectedStock(stock as StockData)}
                    onDelete={handleDelete}
                    index={index}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          <Dialog open={!!selectedStock} onOpenChange={() => setSelectedStock(null)}>
            <DialogContent className="w-full max-w-3xl bg-popover">
              <DialogHeader>
                <DialogTitle>{selectedStock?.name} ({selectedStock?.ticker})</DialogTitle>
              </DialogHeader>
              <ChartAreaGradient ticker={selectedStock?.ticker} />
            </DialogContent>
          </Dialog>
        </div>

      </div>
      <div className="mt-6">
        <StockMarketNews />
      </div>
    </div>
  );
};

const HomePage = () => {
    const { user, loading } = useAuth();
  const { newChat } = useChat();
  const router = useRouter();

  const handleNewChat = () => {
    newChat();
    router.push('/chat');
  };

  if (user) {
    return <AuthenticatedDashboard />;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className='flex-col'>
          <h1 className="text-2 font-bold">Welcome to Arbor!</h1>
          <h2 className="text-0">Where you can learn more about money👀💸</h2>
        </div>
        <Button onClick={handleNewChat}>Chat with Arbor</Button>
      </div>
      <StockMarketNews />
    </div>
  );
};

export default HomePage;
