'use client';

import { useState } from 'react';
import { useAuth, getFirebaseAuthErrorMessage } from '@/components/ai-elements/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const ForgotPassword = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { sendPasswordResetEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error: any) {
      const errorMessage = error.code ? getFirebaseAuthErrorMessage(error.code) : error.message || 'An unexpected error occurred.';
      setError(errorMessage);
      console.error('Error sending password reset email:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2 font-bold mb-4">Forgot Password</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='text-secondary-foreground'
        />
        <Button type="submit" className="w-full bg-accent text-accent-foreground" variant="primary">Send Password Reset Email</Button>
      </form>
      <Button variant="link" onClick={onSwitchToLogin} className='text-primary mt-4'>
        Back to Login
      </Button>
    </div>
  );
};
