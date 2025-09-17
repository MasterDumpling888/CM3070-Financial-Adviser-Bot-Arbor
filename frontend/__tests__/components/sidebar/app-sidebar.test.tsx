import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppSidebar } from '@/components/sidebar/app-sidebar';

jest.mock('@/components/ui/logo', () => ({
  Logo: () => <div>Logo</div>,
}));

jest.mock('@/components/ui/sidebar', () => {
  const Sidebar = ({ children }) => <div data-testid="sidebar">{children}</div>;
  Sidebar.displayName = 'Sidebar';
  const SidebarContent = ({ children }) => <div data-testid="sidebar-content">{children}</div>;
  SidebarContent.displayName = 'SidebarContent';
  const SidebarGroup = ({ children }) => <div data-testid="sidebar-group">{children}</div>;
  SidebarGroup.displayName = 'SidebarGroup';
  const SidebarGroupContent = ({ children }) => <div data-testid="sidebar-group-content">{children}</div>;
  SidebarGroupContent.displayName = 'SidebarGroupContent';
  const SidebarGroupLabel = ({ children }) => <div data-testid="sidebar-group-label">{children}</div>;
  SidebarGroupLabel.displayName = 'SidebarGroupLabel';
  const SidebarHeader = ({ children }) => <div data-testid="sidebar-header">{children}</div>;
  SidebarHeader.displayName = 'SidebarHeader';
  const SidebarMenu = ({ children }) => <div data-testid="sidebar-menu">{children}</div>;
  SidebarMenu.displayName = 'SidebarMenu';
  const SidebarMenuAction = ({ children }) => <button>{children}</button>;
  SidebarMenuAction.displayName = 'SidebarMenuAction';
  const SidebarMenuButton = ({ children, onClick }) => <button onClick={onClick}>{children}</button>;
  SidebarMenuButton.displayName = 'SidebarMenuButton';
  const SidebarMenuItem = ({ children }) => <div data-testid="sidebar-menu-item">{children}</div>;
  SidebarMenuItem.displayName = 'SidebarMenuItem';
  const SidebarRail = () => <div data-testid="sidebar-rail">SidebarRail</div>;
  SidebarRail.displayName = 'SidebarRail';
  const SidebarTrigger = () => <button>Trigger</button>;
  SidebarTrigger.displayName = 'SidebarTrigger';


  return {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger,
    useSidebar: () => ({ isMobile: false, state: 'expanded' }),
  };
});

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }) => <div role="menuitem" onClick={onClick}>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuTrigger: ({ children }) => <div>{children}</div>,
}));

jest.mock('@/components/ai-elements/auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/context/ChatContext', () => ({
  useChat: jest.fn(),
}));

jest.mock('@/components/ai-elements/login', () => ({
  Login: () => <div>Login Form</div>,
}));

jest.mock('@/components/ai-elements/signup', () => ({
  Signup: () => <div>Signup Form</div>,
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }) => (open ? <div data-testid="dialog-open">{children}</div> : <div data-testid="dialog-closed">{children}</div>),
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogDescription: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <div>{children}</div>,
  DialogTrigger: ({ children }) => <div>{children}</div>,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('AppSidebar', () => {
  describe('unauthenticated state', () => {
    beforeEach(() => {
      (require('@/components/ai-elements/auth').useAuth as jest.Mock).mockReturnValue({
        user: null,
        signout: jest.fn(),
      });
      (require('@/context/ChatContext').useChat as jest.Mock).mockReturnValue({
        currentConversationId: null,
        setCurrentConversationId: jest.fn(),
        newChat: jest.fn(),
        conversationCreated: false,
        setConversationCreated: jest.fn(),
      });
    });

    it('renders Login and Sign up buttons', () => {
      render(<AppSidebar />);
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });

    it('opens the login dialog when Login button is clicked', () => {
      render(<AppSidebar />);
      fireEvent.click(screen.getByText('Login'));
      expect(screen.getByText('Login Form')).toBeInTheDocument();
    });

    it('opens the signup dialog when Sign up button is clicked', () => {
      render(<AppSidebar />);
      fireEvent.click(screen.getByText('Sign up'));
      expect(screen.getByText('Signup Form')).toBeInTheDocument();
    });
  });

  describe('authenticated state', () => {
    const signoutMock = jest.fn();
    const newChatMock = jest.fn();
    beforeEach(() => {
      (require('@/components/ai-elements/auth').useAuth as jest.Mock).mockReturnValue({
        user: { uid: 'test-uid' },
        signout: signoutMock,
      });
      (require('@/context/ChatContext').useChat as jest.Mock).mockReturnValue({
        currentConversationId: null,
        setCurrentConversationId: jest.fn(),
        newChat: newChatMock,
        conversationCreated: false,
        setConversationCreated: jest.fn(),
      });
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ conversations: [{ id: '1', title: 'Test Conversation' }] }),
        })
      ) as jest.Mock;
    });

    it('renders navigation links', async () => {
      render(<AppSidebar />);
      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Watchlist')).toBeInTheDocument();
      });
    });

    it('renders sign out and new chat buttons', async () => {
      render(<AppSidebar />);
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
        expect(screen.getByText('New Chat')).toBeInTheDocument();
      });
    });

    it('renders conversations', async () => {
      render(<AppSidebar />);
      expect(await screen.findByText('Test Conversation')).toBeInTheDocument();
    });

    it('calls signout when sign out button is clicked', async () => {
      render(<AppSidebar />);
      await waitFor(() => {
        fireEvent.click(screen.getByText('Logout'));
        expect(signoutMock).toHaveBeenCalled();
      });
    });

    it('calls newChat when new chat button is clicked', async () => {
      render(<AppSidebar />);
      await waitFor(() => {
        fireEvent.click(screen.getByText('New Chat'));
        expect(newChatMock).toHaveBeenCalled();
      });
    });

    it('deletes a conversation', async () => {
      render(<AppSidebar />);
      const conversation = await screen.findByText('Test Conversation');
      const dropdownTrigger = conversation.nextElementSibling;
      fireEvent.click(dropdownTrigger);
      const deleteButton = await screen.findByRole('menuitem', { name: /delete/i });
      fireEvent.click(deleteButton);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/conversations/test-uid/1', { method: 'DELETE' });
      });
    });

    it('renames a conversation', async () => {
      render(<AppSidebar />);
      const conversation = await screen.findByText('Test Conversation');
      const dropdownTrigger = conversation.nextElementSibling;
      fireEvent.click(dropdownTrigger);
      const renameButton = await screen.findByRole('menuitem', { name: /rename/i });
      fireEvent.click(renameButton);
      const renameInput = await screen.findByDisplayValue('Test Conversation');
      fireEvent.change(renameInput, { target: { value: 'New Title' } });
      const renameConfirmButton = await screen.findByRole('button', { name: /rename/i });
      fireEvent.click(renameConfirmButton);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/conversations/test-uid/1/rename', { 
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ new_title: 'New Title' })
        });
      });
    });
  });
});
