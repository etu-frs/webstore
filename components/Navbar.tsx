
import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { APP_NAME, NAV_LINKS } from '../constants';
import { CartContext, ThemeContext } from '../App'; 

const CartIcon: React.FC = () => {
  const cartContext = useContext(CartContext);
  if (!cartContext) return null;
  const { cart } = cartContext;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link to="/cart" className="relative p-2 rounded-full hover:bg-gumball-yellow/20 dark:hover:bg-gumball-yellow/30 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-white hover:text-gumball-pink">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-gumball-pink text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounceOnce">
          {itemCount}
        </span>
      )}
    </Link>
  );
};

const ThemeToggleButton: React.FC = () => {
  const themeCtx = useContext(ThemeContext);
  if (!themeCtx) return null;

  return (
    <button
      onClick={themeCtx.toggleTheme}
      className="p-2 rounded-full text-white hover:bg-gumball-yellow/20 dark:hover:bg-gumball-yellow/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gumball-yellow"
      aria-label={themeCtx.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {themeCtx.theme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 008.25-4.502Z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0Z" />
        </svg>
      )}
    </button>
  );
};


export const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-gumball-blue shadow-lg sticky top-0 z-50 dark:bg-gumball-blue/90"> {/* Increased z-index to z-50 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center min-w-0 mr-2"> {/* Allow shrinking and add small margin */}
            <Link to="/" className="group overflow-hidden md:overflow-visible"> {/* Allow content to be hidden if needed for truncate */}
              <span className="font-display text-xl xxs:text-2xl sm:text-3xl text-white group-hover:text-gumball-yellow transition-colors duration-300 group-hover:animate-wiggleSoft inline-block truncate md:whitespace-normal md:overflow-visible">
                {/* Responsive font size, truncate for small, allow wrap and visibility for medium+ */}
                {APP_NAME}
              </span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-110
                    ${location.pathname === link.path 
                      ? 'bg-gumball-yellow text-gumball-dark shadow-inner ring-2 ring-gumball-pink/70 dark:text-gumball-dark' 
                      : 'text-white hover:bg-gumball-purple hover:text-white dark:hover:bg-gumball-purple/80'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0"> {/* Ensure icons don't shrink */}
             <ThemeToggleButton />
             <CartIcon />
          </div>
          <div className="-mr-2 flex md:hidden items-center flex-shrink-0"> {/* Ensure icons don't shrink */}
            <ThemeToggleButton />
            <CartIcon />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="ml-2 bg-gumball-purple p-2 inline-flex items-center justify-center rounded-md text-white hover:bg-gumball-pink focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen} // Corrected aria-expanded state
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 animate-fadeIn">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300
                  ${location.pathname === link.path 
                    ? 'bg-gumball-yellow text-gumball-dark ring-2 ring-gumball-pink/70 dark:text-gumball-dark' 
                    : 'text-white hover:bg-gumball-purple hover:text-white dark:hover:bg-gumball-purple/80'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
