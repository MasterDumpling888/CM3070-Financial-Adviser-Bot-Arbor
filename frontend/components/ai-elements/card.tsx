'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/ai-elements/auth';
import { TooltipButton } from "@/components/ui/tooltip-button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ChartAreaGradient } from '@/components/charts/area-chart-gradient';
import { FinancialTerm } from '@/components/ai-elements/financial-term';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface CardProps {
  card: {
    ticker: string;
    name: string;
    recommendation: {
      action: string;
      summary: string | { term: string; definition: string }[];
      action_tags: string[];
    };
    prediction_date: string;
    analysis: {
      pros: (string | { term: string; definition: string }[])[];
      cons: (string | { term: string; definition: string }[])[];
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
  };
  isCollapsible?: boolean;
  onCollapse?: () => void;
}

export const Card = ({ card, isCollapsible = false, onCollapse }: CardProps) => {
  const { user } = useAuth();
  const [userWatchlist, setUserWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserWatchlist = async () => {
      if (user) {
        try {
          const response = await fetch(`http://localhost:8000/watchlist/${user.uid}`);
          if (response.ok) {
            const data = await response.json();
            setUserWatchlist(data.watchlist.map((item: any) => item.ticker));
          }
        } catch (error) {
          console.error('Error fetching user watchlist:', error);
        }
      } else {
        setUserWatchlist([]); // Clear watchlist if user logs out
      }
    };
    fetchUserWatchlist();
  }, [user]);

  const handleAddToWatchlist = async () => {
    if (user) {
      const docRef = doc(db, `users/${user.uid}/watchlist`, card.ticker);
      await setDoc(docRef, { ticker: card.ticker, name: card.name || card.ticker });
      toast.success(`${card.ticker} has been added to your watchlist.`);
      setUserWatchlist((prev) => [...prev, card.ticker]); // Update local state
    }
  };

  return (
    <TooltipProvider>
    <div className="my-2 rounded-xl">
      {isCollapsible && (
        <div className="flex justify-end">
          <Button onClick={onCollapse} variant="ghost" size="sm">
            Collapse &uarr;
          </Button>
        </div>
      )}
      <div className="flex items-center justify-between flex-wrap">
        <h3>{card.ticker}</h3>
        {user && (
          <div className=' flex justify-center'>
            <TooltipButton
              onClick={handleAddToWatchlist}
              size="sm"
              className="w-full btn btn-outline"
              disabled={userWatchlist.includes(card.ticker)}
              tooltipContent={userWatchlist.includes(card.ticker) ? 'Already in your watchlist' : 'Add this stock to your watchlist'}
            >
              {userWatchlist.includes(card.ticker) ? 'In Watchlist' : '+ Add to Watchlist'}
            </TooltipButton>
          </div>
        )}
        <div className='flex flex-wrap'>
          <Badge variant={'default'} className={'badge'}>
            {card.recommendation.action}
          </Badge>
        </div>
      </div>
        <p className="text-card-secondary">{card.prediction_date}</p>
      <div className="my-2">
        {typeof card.recommendation.summary === 'string'
          ? card.recommendation.summary
          : <FinancialTerm parts={card.recommendation.summary} />}
      </div>
      <div className="flex flex-wrap gap-2">
        {card.recommendation.action_tags.map((tag) => (
          <Badge key={tag} variant="secondary" className='badge secondary'>
            {tag}
          </Badge>
        ))}
      </div>
      <div className="my-4">
        <ChartAreaGradient ticker={card.ticker}/>
      </div>
      <div className="my-4">
        <h4 className='text-card-secondary' >Pros</h4>
        <ul className="list-disc list-inside">
          {card.analysis.pros.map((pro, index) => (
            <li key={index}>
              {typeof pro === 'string' ? pro : <FinancialTerm parts={pro} />}
            </li>
          ))}
        </ul>
      </div>
      <div className="my-4">
        <h4 className='text-card-secondary' >Cons</h4>
        <ul className="list-disc list-inside">
          {card.analysis.cons.map((con, index) => (
            <li key={index}>
              {typeof con === 'string' ? con : <FinancialTerm parts={con} />}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className='text-card-secondary'>Key Metrics</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className=" text-card-secondary">Close Price</p>
            <p>{card.data.close_price.toFixed(2)}</p>
          </div>
          <div>
            <p className=" text-card-secondary">Volume</p>
            <p>{card.data.volume.toFixed(2)}</p>
          </div>
          <div>
            <p className=" text-card-secondary">MACD</p>
            <p>{card.data.technical_indicators.macd.toFixed(2)}</p>
          </div>
          <div>
            <p className=" text-card-secondary">RSI 30</p>
            <p>{card.data.technical_indicators.rsi_30.toFixed(2)}</p>
          </div>
          <div>
            <p className=" text-card-secondary">CCI 30</p>
            <p>{card.data.technical_indicators.cci_30.toFixed(2)}</p>
          </div>
          <div>
            <p className=" text-card-secondary">Upper Bollinger Band</p>
            <p>{card.data.technical_indicators.boll_ub.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-card-secondary">Lower Bollinger Band</p>
            <p>{card.data.technical_indicators.boll_lb.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-card-secondary">30-period DeMarker</p>
            <p>{card.data.technical_indicators.dx_30.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-card-secondary">Simple Moving Average 30</p>
            <p>{card.data.technical_indicators.close_30_sma.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-card-secondary">Simple Moving Average 60</p>
            <p>{card.data.technical_indicators.close_60_sma.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
    </div>
    </TooltipProvider>
  );
};
