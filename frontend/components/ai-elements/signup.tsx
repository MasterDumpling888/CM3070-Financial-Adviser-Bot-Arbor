'use client';

import { useState } from 'react';
import { useAuth, getFirebaseAuthErrorMessage } from '@/components/ai-elements/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Signup = ({ onSignupSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [error, setError] = useState('');
  const { signup } = useAuth();

  const validatePassword = (pwd) => {
    setPasswordRequirements({
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password);
      if (onSignupSuccess) {
        onSignupSuccess();
      }
    } catch (error: any) {
      const errorMessage = error.code ? getFirebaseAuthErrorMessage(error.code) : error.message || 'An unexpected error occurred.';
      setError(errorMessage);
      console.error('Error signing up:', error);
    }
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  return (
    <div>
      <h2 className="text-2 font-bold mb-4">Sign up</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
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
          onChange={(e) => {
            setPassword(e.target.value);
            validatePassword(e.target.value);
          }}
          className='text-secondary-foreground'
          
        />
        <div className="text-sm mt-2 space-y-1">
          <p className={passwordRequirements.minLength ? "text-green-500" : "text-red-500"}>
            {passwordRequirements.minLength ? '✓' : '✗'} At least 8 characters
          </p>
          <p className={passwordRequirements.hasUppercase ? "text-green-500" : "text-red-500"}>
            {passwordRequirements.hasUppercase ? '✓' : '✗'} At least one uppercase letter
          </p>
          <p className={passwordRequirements.hasLowercase ? "text-green-500" : "text-red-500"}>
            {passwordRequirements.hasLowercase ? '✓' : '✗'} At least one lowercase letter
          </p>
          <p className={passwordRequirements.hasNumber ? "text-green-500" : "text-red-500"}>
            {passwordRequirements.hasNumber ? '✓' : '✗'} At least one number
          </p>
          <p className={passwordRequirements.hasSpecialChar ? "text-green-500" : "text-red-500"}>
            {passwordRequirements.hasSpecialChar ? '✓' : '✗'} At least one special character
          </p>
        </div>
        <Button type="submit" className="w-full bg-accent text-accent-foreground" variant="primary" disabled={!allRequirementsMet}>Sign Up</Button>
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
