import React, { useState, useContext, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from '../components/Button';
import { APP_NAME } from '../constants';

export const LoginPage: React.FC = () => {
  const authCtx = useContext(AuthContext);
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!authCtx) {
    return <p>Authentication system is currently unavailable. Please contact support.</p>;
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (authCtx.loginAdmin(password)) {
        navigate('/admin', { replace: true });
      } else {
        setError('Incorrect password. Please try again.');
        setPassword(''); // Clear password field on error
      }
      setIsLoading(false);
    }, 500);
  };

  if (authCtx.isAdminAuthenticated) {
    // If already authenticated, redirect to admin panel
    // This can happen if the user navigates to /login manually while already logged in
    navigate('/admin', { replace: true });
    return null; // or a loading spinner while redirecting
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] bg-gradient-to-br from-gumball-blue via-gumball-purple to-gumball-pink p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-gumball-dark-card shadow-2xl rounded-xl p-8 transform transition-all hover:scale-105">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display text-gumball-yellow">
            {APP_NAME}
          </h1>
          <p className="text-lg font-techno text-gumball-dark dark:text-gumball-light-bg mt-2">
            Admin Access Portal
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="adminPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Administrator Password:
            </label>
            <input
              type="password"
              id="adminPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-gumball-pink focus:border-gumball-pink dark:bg-gumball-dark dark:text-gumball-light-bg dark:placeholder-gray-400"
              required
              placeholder="Enter password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-400 p-3 rounded-md animate-wiggleSoft">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-display text-xl"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Login'}
          </Button>
        </form>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center">
          For authorized personnel only.
        </p>
      </div>
    </div>
  );
};