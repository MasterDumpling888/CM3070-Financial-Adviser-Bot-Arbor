'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/ai-elements/auth';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { ChartAreaGradient } from '@/components/charts/area-chart-gradient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
}

const WatchlistPage = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  
  const [averagePerformance, setAveragePerformance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleDelete = async (ticker: string) => {
    if (user) {
      const docRef = doc(db, `users/${user.uid}/watchlist`, ticker);
      await deleteDoc(docRef);
      setWatchlist(watchlist.filter((item) => item.ticker !== ticker));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Watchlist</h1>
      <div>
        {watchlist.map((stock, index) => (
          <WatchlistItemCard
            key={stock.ticker}
            stock={stock}
            onClick={setSelectedStock}
            onDelete={handleDelete}
            index={index}
          />
        ))}
      </div>
      <Dialog open={!!selectedStock} onOpenChange={() => setSelectedStock(null)}>
        <DialogContent className="w-full max-w-3xl bg-popover">
          <DialogHeader>
            <DialogTitle>{selectedStock?.name} ({selectedStock?.ticker})</DialogTitle>
          </DialogHeader>
          <ChartAreaGradient ticker={selectedStock?.ticker} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WatchlistPage;
