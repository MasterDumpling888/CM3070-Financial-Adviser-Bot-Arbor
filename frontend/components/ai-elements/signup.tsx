'use client';

import { useState } from 'react';
import { useAuth } from '@/components/ai-elements/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Signup = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password);
      if (onSignupSuccess) {
        onSignupSuccess();
      }
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2 font-bold mb-4">Sign up</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <Button type="submit" className="w-full bg-accent text-accent-foreground" variant="primary">Sign Up</Button>
      </form>
      <p className="text-sm mt-4">
        Already have an account?{' '}
        <Button variant="link" onClick={onSwitchToLogin} className="text-primary">
          Login
        </Button>
      </p>
    </div>
  );
};
