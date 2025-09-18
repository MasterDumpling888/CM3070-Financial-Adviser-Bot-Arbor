'use client';

import { useState } from 'react';
import { useAuth, getFirebaseAuthErrorMessage } from '@/components/ai-elements/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Login = ({ onLoginSuccess, onSwitchToSignup, onSwitchToForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signin(email, password);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error: any) {
      const errorMessage = error.code ? getFirebaseAuthErrorMessage(error.code) : error.message || 'An unexpected error occurred.';
      setError(errorMessage);
      console.error('Error signing in:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2 font-bold mb-4">Login</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 ">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='text-secondary-foreground'
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='text-secondary-foreground'
        />
        <Button type="submit" className="w-full bg-accent text-accent-foreground" variant="primary">Sign In</Button>
      </form>
      <p className="text-sm mt-4">
        Don&apos;t have an account?{' '}
        <Button variant="link" onClick={onSwitchToSignup} className='text-primary'>
          Sign up
        </Button>
        <Button variant="link" onClick={onSwitchToForgotPassword} className='text-primary'>
          Forgot Password?
        </Button>
      </p>
    </div>
  );
};
