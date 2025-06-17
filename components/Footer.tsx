import React from 'react';
import { APP_NAME } from '../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gumball-dark text-gumball-light-bg py-8 mt-12 dark:bg-gumball-dark-deep dark:text-gray-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="font-display text-xl text-gumball-yellow mb-2">
          Thank you for visiting {APP_NAME}!
        </p>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
        <p className="text-xs mt-2 font-techno text-gumball-green/80 hover:text-gumball-green hover:animate-subtleGlow transition-colors dark:text-gumball-green/70 dark:hover:text-gumball-green">
          Innovative Technology Solutions.
        </p>
      </div>
    </footer>
  );
};