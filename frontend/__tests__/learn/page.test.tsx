import { render, screen, fireEvent } from '@testing-library/react';
import LearnPage from '@/app/learn/page';

// Mock the FinancialFlashcards component
jest.mock('@/components/flashcards/financial-flashcards', () => {
  return function DummyFinancialFlashcards() {
    return <div data-testid="financial-flashcards">Financial Flashcards</div>;
  };
});

describe('LearnPage', () => {
  it('renders the dictionary by default', () => {
    render(<LearnPage />);
    expect(screen.getByText('Learn Financial Terms')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for a term...')).toBeInTheDocument();
    // Check for a term from the dictionary using data-testid
    expect(screen.getByTestId('term-title-stock')).toBeInTheDocument();
  });

  it('filters the dictionary based on search term', () => {
    render(<LearnPage />);
    const searchInput = screen.getByPlaceholderText('Search for a term...');
    fireEvent.change(searchInput, { target: { value: 'bond' } });
    // Check for the filtered term using data-testid
    expect(screen.getByTestId('term-title-bond')).toBeInTheDocument();
    // Ensure other terms are not present
    expect(screen.queryByTestId('term-title-stock')).not.toBeInTheDocument();
  });

  it('switches to flashcard mode', () => {
    render(<LearnPage />);
    const flashcardSwitch = screen.getByRole('switch');
    fireEvent.click(flashcardSwitch);
    expect(screen.getByTestId('financial-flashcards')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Search for a term...')).not.toBeInTheDocument();
  });
});
