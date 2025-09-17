
import React from 'react';
import { render, screen } from '@testing-library/react';
import StockMarketNews from '@/components/stock-market-news';

describe('StockMarketNews', () => {
  const mockNews = [
    {
      id: 1,
      headline: 'Test Headline 1',
      summary: 'Test Summary 1',
      source: 'Test Source 1',
      url: 'https://test.com/1',
      image: 'https://test.com/image1.jpg',
    },
    {
      id: 2,
      headline: 'Test Headline 2',
      summary: 'Test Summary 2',
      source: 'Test Source 2',
      url: 'https://test.com/2',
      image: 'https://test.com/image2.jpg',
    },
  ];

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('renders loading state initially', () => {
    render(<StockMarketNews />);
    expect(screen.getByText('Loading news...')).toBeInTheDocument();
  });

  it('renders error state on fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch news'));
    render(<StockMarketNews />);
    expect(await screen.findByText('Error: Failed to fetch news')).toBeInTheDocument();
  });

  it('renders news articles on successful fetch', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockNews),
    });
    render(<StockMarketNews />);

    expect(await screen.findByText('Test Headline 1')).toBeInTheDocument();
    expect(screen.getByText('Test Headline 2')).toBeInTheDocument();
    expect(screen.getByText('Test Source 1')).toBeInTheDocument();
    expect(screen.getByText('Test Source 2')).toBeInTheDocument();
  });
});
