import React from 'react';
import { GlobeIcon, SearchIcon } from './IconComponents';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <header className="sticky top-0 z-20 bg-black/30 backdrop-blur-xl border-b border-gray-500/20">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-shrink-0">
          <GlobeIcon className="h-8 w-8 text-violet-400" />
          <h1 className="hidden sm:block text-2xl font-bold tracking-tight gradient-text">
            UNZA Geodatabase
          </h1>
        </div>

        <div className="flex-1 min-w-0 max-w-xl">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              name="search"
              id="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-800/60 text-gray-200 placeholder-gray-400 transition-all text-sm"
              placeholder="Search by title or description..."
            />
          </div>
        </div>
        
        <button className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-opacity-50 text-sm font-semibold shadow-lg shadow-violet-900/50">
          Contact Admin
        </button>
      </div>
    </header>
  );
};
