'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownIcon } from "lucide-react";

export const WatchlistCard = ({ card, onSelect, index }) => {
  const { ticker, recommendation } = card;

  const colorVar = `--watchlist-item-${(index % 5) + 1}`;


  return (
    <Card
      className="p-4 border-0 rounded-lg mb-2 cursor-pointer hover:opacity-80 transition-opacity items-center gap-2"
      onClick={() => onSelect(card)}
      style={{ background: `var(${colorVar})` }}
    >
      <CardContent className="flex items-center justify-between">
        <p className="font-bold text-lg">{ticker}</p>
        {recommendation?.action && (
          <Badge className={recommendation.action === 'BUY' ? 'badge negative' : 'badge'}>
            {recommendation.action}
          </Badge>
        )}
      </CardContent>
      <div className="bg-muted rounded-2xl px-2">
        <ArrowDownIcon/>
      </div>
    </Card>
  );
};