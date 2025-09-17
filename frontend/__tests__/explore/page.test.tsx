import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExplorePage from '@/app/explore/page';
import { useAuth } from '@/components/ai-elements/auth';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';

// Mock the useAuth hook
jest.mock('@/components/ai-elements/auth', () => ({
  useAuth: jest.fn(),
}));

// Mock Firestore
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
}));

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn((url) => {
  if (url.toString().includes('stocks?limit=10')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ stocks: ['AAPL', 'GOOGL', 'MSFT'] }),
    });
  }
  if (url.toString().includes('stock_data?tickers')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { ticker: 'AAPL', name: 'Apple Inc.' },
        { ticker: 'GOOGL', name: 'Alphabet Inc.' },
        { ticker: 'MSFT', name: 'Microsoft Corporation' },
      ]),
    });
  }
  if (url.toString().includes('stock/APPLE')) {
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ticker: 'AAPL', name: 'Apple Inc.' })
    });
  }
  return Promise.reject(new Error('unhandled fetch request'));
});

describe('ExplorePage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the Explore Stocks heading', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<ExplorePage />);
    expect(screen.getByText('Explore Stocks')).toBeInTheDocument();
  });

  it('fetches and displays a list of stocks', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<ExplorePage />);
    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
      expect(screen.getByText('MSFT')).toBeInTheDocument();
    });
  });

  it('filters stocks based on search term', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<ExplorePage />);
    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search for more stocks...');
    fireEvent.change(searchInput, { target: { value: 'Apple' } });

    await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument();
        expect(screen.queryByText('GOOGL')).not.toBeInTheDocument();
        expect(screen.queryByText('MSFT')).not.toBeInTheDocument();
    });
  });

  it('calls handleAddToWatchlist when the "Add to Watchlist" button is clicked', async () => {
    const mockUser = { uid: '123' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    render(<ExplorePage />);
    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('+ Add to Watchlist')[0]);

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(doc(db, 'users/123/watchlist', 'AAPL'), { ticker: 'AAPL', name: 'Apple Inc.' });
      expect(toast.success).toHaveBeenCalledWith('AAPL has been added to your watchlist.');
    });
  });
});