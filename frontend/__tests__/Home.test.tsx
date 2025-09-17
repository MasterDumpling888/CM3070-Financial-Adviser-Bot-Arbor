import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from '../app/page';
import { useAuth } from '@/components/ai-elements/auth';

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  onSnapshot: jest.fn(() => () => {}),
}));

jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
  app: {},
}));

jest.mock('@/components/ai-elements/auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/context/ChatContext', () => ({
  useChat: () => ({
    newChat: jest.fn(),
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/components/stock-market-news', () => {
  const StockMarketNews = () => <div>Stock Market News</div>;
  StockMarketNews.displayName = 'StockMarketNews';
  return StockMarketNews;
});

jest.mock('@/components/watchlist/WatchlistItemCard', () => ({
  WatchlistItemCard: ({ stock }: { stock: { ticker: string } }) => <div>{stock.ticker}</div>,
}));

describe('HomePage', () => {
  describe('unauthenticated state', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
        loading: false,
      });
    });

    it('renders the stock market news and chat button for an unauthenticated user', () => {
      render(<HomePage />);

      expect(screen.getByText(/stock market news/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /chat with arbor/i })).toBeInTheDocument();
    });
  });

  describe('authenticated state', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { uid: 'test-uid' },
        loading: false,
      });

      global.fetch = jest.fn((url) => {
        if (url.toString().includes('/conversations/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ conversations: [] }),
          });
        }
        if (url.toString().includes('/watchlist/')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                watchlist: [
                  { ticker: 'AAPL', name: 'Apple Inc.', price: 150.0, change: 1.5 },
                  { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 2800.0, change: -10.0 },
                ],
              }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }) as jest.Mock;
    });

    it('renders the dashboard for an authenticated user', async () => {
      render(<HomePage />);
      await waitFor(() => {
        expect(screen.getByText("Here's your summary for today")).toBeInTheDocument();
      });
    });

    it('renders the watchlist for an authenticated user', async () => {
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Your Watchlist')).toBeInTheDocument();
        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.getByText('GOOGL')).toBeInTheDocument();
      });
    });
  });
});