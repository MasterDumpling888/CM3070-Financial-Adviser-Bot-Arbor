'use client';

import { Logo } from '@/components/ui/logo';


import { Heart, User, MoreHorizontal, FilePen, Trash2, Plus, LogOut, LogIn, UserPlus, Sun, Moon, Compass, BookOpen } from "lucide-react";
import {
  Sidebar,  SidebarContent,
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
  useSidebar
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useTheme } from "next-themes";
import { useAuth } from '@/components/ai-elements/auth';
import { useEffect, useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { Login } from '@/components/ai-elements/login';
import { Signup } from '@/components/ai-elements/signup';
import { ForgotPassword } from '@/components/ai-elements/forgot-password';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';

import Link from 'next/link';
import { Button } from '../ui/button';

const info = {
  pages: [
    {
      title: "Profile",
      url: "/profile",
      icon: User
    },
    {
      title: "Watchlist",
      url: "/watchlist",
      icon: Heart
    },
    {
      title: "Explore",
      url: "/explore",
      icon: Compass
    },
    {
      title: "Learn",
      url: "/learn",
      icon: BookOpen
    }
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [conversations, setConversations] = useState([]);
  const { user, signout } = useAuth();
  const {currentConversationId, setCurrentConversationId, newChat, conversationCreated, setConversationCreated } = useChat();
  const [authView, setAuthView] = useState('login');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  
  const [renameConversationId, setRenameConversationId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [conversationUpdated, setConversationUpdated] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const { theme, setTheme } = useTheme();
  const { isMobile, state } = useSidebar()
  const router = useRouter();
  
  useEffect(() => {
    const fetchConversations = async () => {
      if (user) {
        try {
          const response = await fetch(`http://localhost:8000/conversations/${user.uid}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setConversations(data.conversations);
          if (conversationCreated) {
            setConversationCreated(false);
          }
          if (conversationUpdated) {
            setConversationUpdated(false);
          }
        } catch (error) {
          console.error('Error fetching conversations:', error);
        }
      }
    };

    fetchConversations();
  }, [user, conversationCreated, currentConversationId, conversationUpdated]);

  const handleNewChat = () => {
    newChat();
    router.push('/chat');
  };

  const handleSwitchToSignup = () => {
    setAuthView('signup');
  };

  const handleSwitchToLogin = () => {
    setAuthView('login');
  };

  const handleSwitchToForgotPassword = () => {
    setAuthView('forgot-password');
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:8000/conversations/${user.uid}/${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setConversationUpdated(true);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleRenameConversation = async () => {
    if (!user || !renameConversationId) return;

    try {
      const response = await fetch(`http://localhost:8000/conversations/${user.uid}/${renameConversationId}/rename`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ new_title: newTitle }),
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setNewTitle("");
      setConversationUpdated(true);
      setRenameConversationId(null);
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  };

  return (
    <>
    <Sidebar {...props} className=' flex justify-center sidebar'>
      {!isMobile && (
        <SidebarHeader className='flex-row justify-between items-center'>
          <Link href="/">
            <Logo variant={theme === 'dark' ? 'white' : 'black'} />
          </Link>
          <SidebarTrigger className="sidebarToggle" />
        </SidebarHeader>
      )}
      <SidebarContent className="flex flex-col justify-between">
        {user ? (
          <div className="flex flex-col justify-between h-full">
            {state === 'expanded' && (
            <SidebarGroup>
              <SidebarGroupLabel>Chats</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className='sidebarMenu bg-transparent'>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleNewChat} className='bg-sidebar-primary text-sidebar-primary-foreground btn'>
                      <Plus />
                      New Chat
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <div className="max-h-[60vh] overflow-y-auto flex flex-col gap-2">
                    {conversations.map((conv) => (
                      <SidebarMenuItem key={conv.id}>
                        <SidebarMenuButton onClick={() => {
                          setCurrentConversationId(conv.id)
                          router.push('/chat')
                        }}>
                          {conv.title}
                        </SidebarMenuButton>
                        <DropdownMenu open={openDropdownId === conv.id} onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? conv.id : null)} modal={false}>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuAction
                              showOnHover
                              className="data-[state=open]:bg-accent rounded-sm"
                            >
                              <MoreHorizontal />
                              <span className="sr-only">More</span>
                            </SidebarMenuAction>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-24 rounded-lg"
                            side={isMobile ? 'bottom' : 'right'}
                            align={isMobile ? 'end' : 'start'}
                          >
                            <DropdownMenuItem onClick={() => {
                              setRenameConversationId(conv.id);
                              setNewTitle(conv.title);
                              setOpenDropdownId(null);
                            }}>
                              <FilePen />
                              <span>Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => handleDeleteConversation(conv.id)}>
                              <Trash2 />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    ))}
                  </div>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            )}
            <SidebarGroup className='justify-end'>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem >
                    <SidebarMenuButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                      {theme === 'dark' ? <Sun /> : <Moon />}
                      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  {info.pages.map((page) => (
                    <SidebarMenuItem key={page.title}>
                      <SidebarMenuButton asChild>
                        <a href={page.url}>
                          <page.icon />
                          {page.title}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={signout}>
                      <LogOut />
                      Logout
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        ) : (
          <>
            <SidebarMenu>
              <SidebarMenuItem >
                <SidebarMenuButton onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? <Sun /> : <Moon />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                <SidebarMenuItem>
                  <DialogTrigger asChild>
                    <SidebarMenuButton onClick={() => setAuthView('login')}>
                      <LogIn />
                      Login
                    </SidebarMenuButton>
                  </DialogTrigger>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <DialogTrigger asChild>
                    <SidebarMenuButton onClick={() => setAuthView('signup')}>
                      <UserPlus />
                      Sign up
                    </SidebarMenuButton>
                  </DialogTrigger>
                </SidebarMenuItem>
                <DialogContent className="w-80  bg-secondary">
                  <DialogTitle className="hidden">
                    {authView === 'login' && 'Login'}
                    {authView === 'signup' && 'Sign Up'}
                    {authView === 'forgot-password' && 'Forgot Password'}
                  </DialogTitle>
                  <DialogDescription className="hidden">
                    {authView === 'login' && 'Login to your account.'}
                    {authView === 'signup' && 'Create a new account.'}
                    {authView === 'forgot-password' && 'Reset your password.'}
                  </DialogDescription>
                  {authView === 'login' && (
                    <Login
                      onLoginSuccess={() => setIsAuthDialogOpen(false)}
                      onSwitchToSignup={handleSwitchToSignup}
                      onSwitchToForgotPassword={handleSwitchToForgotPassword}
                    />
                  )}
                  {authView === 'signup' && (
                    <Signup
                      onSignupSuccess={() => setIsAuthDialogOpen(false)}
                      onSwitchToLogin={handleSwitchToLogin}
                    />
                  )}
                  {authView === 'forgot-password' && (
                    <ForgotPassword onSwitchToLogin={handleSwitchToLogin} />
                  )}
                </DialogContent>
              </Dialog>
            </SidebarMenu>
          </>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
    <Dialog open={!!renameConversationId} onOpenChange={(isOpen) => { if (!isOpen) setRenameConversationId(null); }}>
        <DialogContent className="w-80 bg-secondary">
          <DialogTitle>Rename Conversation</DialogTitle>
          <DialogDescription>
            Enter a new title for your conversation.
          </DialogDescription>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setRenameConversationId(null)} className="btn">Cancel</Button>
            <Button onClick={handleRenameConversation} className="btn bg-accent text-accent-foreground">Rename</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};