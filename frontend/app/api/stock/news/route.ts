import { NextResponse } from 'next/server';

interface MarketauxNewsItem {
  uuid: string;
  title: string;
  image_url: string;
  source: string;
  url: string;
  published_at: string;
  description: string;
}

export async function GET() {
  const apiKey = 'pLxA8Yw1rSnxrAFdhnEcUmdwYxTxak2xZ4j444yg'; // Marketaux API Key
  // Marketaux does not require a category for general news, and it's not ticker-specific here.
  // The endpoint for general news is usually /api/v1/news/all
  // Example: https://api.marketaux.com/v1/news/all?api_token=YOUR_API_TOKEN&filter_entities=true&language=en

  try {
    const response = await fetch(`https://api.marketaux.com/v1/news/all?api_token=${apiKey}&filter_entities=true&language=en`);
    if (!response.ok) {
      throw new Error('Failed to fetch news from Marketaux');
    }
    const data = await response.json();
    
    // Marketaux returns news in a 'data' array, and each news item has 'title', 'description', 'image_url', 'url', 'published_at'
    // We need to map this to the format expected by stock-market-news.tsx
    const formattedNews = data.data.slice(0, 5).map((item: MarketauxNewsItem) => ({
      id: item.uuid,
      headline: item.title,
      image: item.image_url,
      source: item.source,
      url: item.url,
      datetime: item.published_at ? Math.floor(new Date(item.published_at).getTime() / 1000) : 1, // Convert to Unix timestamp
      summary: item.description // Add summary for completeness, though not strictly used by the component
    }));

    return NextResponse.json(formattedNews);
  } catch (error) {
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
  }
}
