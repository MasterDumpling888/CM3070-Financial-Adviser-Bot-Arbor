import { render, screen } from '@testing-library/react';
import ProfilePage from '@/app/profile/page';
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
  doc: jest.fn(),
  onSnapshot: jest.fn(),
}));

describe('ProfilePage', () => {
  it('renders user information correctly', () => {
    // Mock the user data
    const mockUser = {
      uid: '123',
      email: 'test@example.com',
    };
    const mockUserInfo = {
      username: 'Test User',
      about: 'This is a test bio.',
    };

    // Set up the mock implementation for useAuth
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    // Set up the mock implementation for onSnapshot
    const { onSnapshot } = require('firebase/firestore');
    onSnapshot.mockImplementation((_, callback) => {
      callback({
        exists: () => true,
        data: () => mockUserInfo,
      });
      return () => {}; // Unsubscribe function
    });

    render(<ProfilePage />);

    // Check if user information is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('This is a test bio.')).toBeInTheDocument();
  });

  it('renders default information when user data is not available', () => {
    // Mock the user data
    const mockUser = {
      uid: '123',
      email: 'test@example.com',
    };
    const mockUserInfo = {};

    // Set up the mock implementation for useAuth
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });

    // Set up the mock implementation for onSnapshot
    const { onSnapshot } = require('firebase/firestore');
    onSnapshot.mockImplementation((_, callback) => {
      callback({
        exists: () => true,
        data: () => mockUserInfo,
      });
      return () => {}; // Unsubscribe function
    });

    render(<ProfilePage />);

    // Check if default information is displayed
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('No information provided.')).toBeInTheDocument();
  });

  it('renders edit profile button', () => {
    render(<ProfilePage />);
    expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
  });
});