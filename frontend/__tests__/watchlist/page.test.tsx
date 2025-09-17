import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import WatchlistPage from '@/app/watchlist/page';
import { useAuth } from '@/components/ai-elements/auth';
import { db } from '@/lib/firebase';

// Mock the useAuth hook
jest.mock('@/components/ai-elements/auth', () => ({
  useAuth: jest.fn(),
}));

// Mock Firestore
jest.mock('@/lib/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  onSnapshot: jest.fn(),
  doc: jest.fn(),
  deleteDoc: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn((url) => {
  if (url.includes('/historical-data/')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ close: 100 }, { close: 105 }]),
    });
  }
  if (url.includes('/watchlist/')) { // Add this condition
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        watchlist: [
          { ticker: 'AAPL', price: 150.0, change: 1.2 },
          { ticker: 'GOOGL', price: 2800.0, change: -0.5 },
        ],
      }),
    });
  }
  // Default mock for other fetch calls
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
});

describe('WatchlistPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    global.fetch.mockClear(); // Clear fetch mock
  });

  it('renders watchlist correctly with data', async () => {
    // Mock user data
    const mockUser = { uid: '123' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    // Mock Firestore snapshot
    const { onSnapshot } = require('firebase/firestore');
    onSnapshot.mockImplementation((_, callback) => {
      callback({
        docs: [
          { id: 'AAPL', data: () => ({ name: 'Apple Inc.' }) },
          { id: 'GOOGL', data: () => ({ name: 'Alphabet Inc.' }) },
        ],
      });
      return () => {}; // Unsubscribe function
    });

    // Mock fetch response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        watchlist: [
          { ticker: 'AAPL', name: 'Apple Inc.', price: 150.0, change: 1.2 },
          { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 2800.0, change: -0.5 },
        ],
      }),
    });

    await act(async () => {
      render(<WatchlistPage />);
    });

    // Wait for the data to be loaded and rendered
    await waitFor(async () => {
      const aaplElements = await screen.findAllByText('AAPL');
      expect(aaplElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();

      const googlElements = await screen.findAllByText('GOOGL');
      expect(googlElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Alphabet Inc.')).toBeInTheDocument();
    });
  });

  it('handles delete correctly', async () => {
    // Mock user data
    const mockUser = { uid: '123' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    // Mock Firestore snapshot
    const { onSnapshot, doc, deleteDoc } = require('firebase/firestore');
    onSnapshot.mockImplementation((_, callback) => {
      callback({
        docs: [{ id: 'AAPL', data: () => ({ name: 'Apple Inc.' }) }],
      });
      return () => {}; // Unsubscribe function
    });

    // Mock fetch response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        watchlist: [
          { ticker: 'AAPL', price: 150.0, change: 1.2 }
        ]
      }),
    });

    await act(async () => {
      render(<WatchlistPage />);
    });

    // Wait for the data to be loaded
    await waitFor(() => {
      expect(screen.findAllByText('AAPL'))
    });

    // Click the delete button
    fireEvent.click(screen.getByRole('button', { name: /delete item/i }));

    // Check if deleteDoc was called with the correct parameters
    expect(doc).toHaveBeenCalledWith(db, 'users/123/watchlist', 'AAPL');
    expect(deleteDoc).toHaveBeenCalled();
  });

  it('renders empty watchlist message', async () => {
    // Mock user data
    const mockUser = { uid: '123' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    // Mock empty Firestore snapshot
    const { onSnapshot } = require('firebase/firestore');
    onSnapshot.mockImplementation((_, callback) => {
      callback({ docs: [] });
      return () => {}; // Unsubscribe function
    });

    // Mock fetch to return an empty watchlist
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ watchlist: [] }),
    });

    await act(async () => {
      render(<WatchlistPage />);
    });

    // Check if the empty message is displayed
    expect(screen.getByText('My Watchlist')).toBeInTheDocument();
    expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
  });
});