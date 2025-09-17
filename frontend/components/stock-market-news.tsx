'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
interface NewsArticle {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
}

const StockMarketNews = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/stock/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setNews(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div>Loading news...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Card className='card'>
      <CardHeader className='card-header'>
        <CardTitle className='card-title text-center'>Stock Market News</CardTitle>
      </CardHeader>
      <CardContent className='card-content'>
        <div className="grid">
          {news.map((article) => (
            <div key={article.id} className="flex items-start gap-3  pb-3 pt-3">
              {article.image && (
                <img
                  src={article.image}
                  alt={article.headline}
                  className="w-20 h-20 object-cover rounded-3xl"
                />
              )}
              <div>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline text--1">
                  {article.headline}
                </a>
                <p className="text--2 text-primary">{article.source}</p>
                <p className="text--2 mt-1">{article.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockMarketNews;
