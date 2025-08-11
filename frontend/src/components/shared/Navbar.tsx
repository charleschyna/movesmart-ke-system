import React from 'react';
import { motion } from 'framer-motion';

export type NavbarUser = {
  name: string;
  role?: string;
  avatar?: string;
  initials?: string;
  email?: string;
};

type NavbarProps = {
  user?: NavbarUser;
  onSearch?: (query: string) => void;
  onNotificationClick?: (notification: any) => void;
  onProfileAction?: (action: 'profile' | 'settings' | 'logout') => void;
};

const Navbar: React.FC<NavbarProps> = ({ user, onSearch, onNotificationClick, onProfileAction }) => {
  const [query, setQuery] = React.useState('');

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <div className="sticky top-0 z-50 w-full backdrop-blur bg-white/70 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500 to-teal-500" />
            <span className="font-semibold">MoveSmart KE</span>
          </div>

          {/* Search */}
          <form onSubmit={submitSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-2 rounded-md bg-white/80 border border-white/20 shadow-sm focus:outline-none"
                placeholder="Search roads, routes, incidents..."
              />
              <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 text-sm px-2 py-1 rounded bg-emerald-500 text-white">
                Go
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNotificationClick?.({ type: 'demo' })}
              className="w-9 h-9 rounded-full bg-white/80 border border-white/20 flex items-center justify-center"
              aria-label="Notifications"
            >
              🔔
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <button
              onClick={() => onProfileAction?.('profile')}
              className="flex items-center gap-2"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm">
                  {user?.initials ?? '👤'}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium">{user?.name ?? 'Guest'}</div>
                <div className="text-xs text-gray-500">{user?.role ?? 'Visitor'}</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

