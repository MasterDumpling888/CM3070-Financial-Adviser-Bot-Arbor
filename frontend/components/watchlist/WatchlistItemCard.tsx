'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { MiniChart } from '@/components/charts/mini-chart';

interface WatchlistItemCardProps {
  stock: WatchlistItem;
  onDelete: (ticker: string) => void;
  onClick: (stock: WatchlistItem) => void;
  index: number;
}

export const WatchlistItemCard = ({ stock, onDelete, onClick, index }: WatchlistItemCardProps) => {
  const colorVar = `--watchlist-item-${(index % 5) + 1}`;
  return (
    <Card className="mb-2 cursor-pointer card" onClick={() => onClick(stock)} style={{ background: `var(${colorVar})` }}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex flex-col">
          <p className="font-bold text-lg">{stock.ticker}</p>
          <p className="text-sm text-muted-foreground">{stock.name}</p>
          {stock.error && <p className="text-xs text-red-500">{stock.error}</p>}
        </div>
        <div className="flex items-center space-x-4">
          <div style={{ height: 50, width: 100 }}>
            <MiniChart ticker={stock.ticker} />
          </div>
          <div className="text-right">
            <p className="font-bold">{stock.error ? 'N/A' : `$${stock.price.toFixed(2)}`}</p>
            <p className={stock.error ? '' : stock.change >= 0 ? "text-green-500" : "text-red-500"}>
              {stock.error ? 'N/A' : `${stock.change.toFixed(2)}%`}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(stock.ticker); }} aria-label="delete item">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};