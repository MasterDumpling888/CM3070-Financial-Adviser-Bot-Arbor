'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/components/ai-elements/auth';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface StockData {
  ticker: string;
  name: string;
}

const ExplorePage = () => {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [searchResults, setSearchResults] = useState<StockData[]>([]);

  useEffect(() => {
    const fetchTopStocks = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/stocks?limit=10');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const topTickers = data.stocks || [];

        if (topTickers.length === 0) {
          setLoading(false);
          return;
        }

        const stockDataResponse = await fetch(`http://localhost:8000/stock_data?tickers=${topTickers.join(',')}`);
        if (stockDataResponse.ok) {
          const stockData = await stockDataResponse.json();
          setStocks(stockData.filter((stock: StockData) => stock.name));
        }
      } catch (error) {
        console.error('Error fetching top stocks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopStocks();
  }, []);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/stock/${term.toUpperCase()}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults([data]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async (stock: StockData) => {
    if (user) {
      const docRef = doc(db, `users/${user.uid}/watchlist`, stock.ticker);
      await setDoc(docRef, { ticker: stock.ticker, name: stock.name });
      toast.success(`${stock.ticker} has been added to your watchlist.`);
    }
  };
  
  const stocksToDisplay = searchTerm.trim() !== '' ? searchResults : stocks;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Explore Stocks</h1>
      <Input
        type="text"
        placeholder="Search for more stocks..."
        className="mb-4"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {loading && stocksToDisplay.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="p-4 rounded-lg flex justify-between items-center gap-2 card border-1">
              <div className='text-center w-full'>
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-24" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stocksToDisplay.map((stock) => (
            <Card key={stock.ticker} className="p-4 rounded-lg flex justify-between items-center gap-2 card border-1">
              <div className='text-center'>
                <p className="font-bold text-0">{stock.ticker}</p>
                <p className="text--1">{stock.name}</p>
              </div>
              <Button onClick={() => handleAddToWatchlist(stock)} className='btn'>+ Add to Watchlist</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
