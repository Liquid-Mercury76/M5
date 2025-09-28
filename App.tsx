import React, { useState } from 'react';
import type { MapEntry } from './types';
import { Header } from './components/Header';
import { MapUploadForm } from './components/MapUploadForm';
import { MapEntryCard } from './components/MapEntryCard';
import { DUMMY_ENTRIES } from './constants';

const App: React.FC = () => {
  const [mapEntries, setMapEntries] = useState<MapEntry[]>(DUMMY_ENTRIES);
  const [searchQuery, setSearchQuery] = useState('');

  const addMapEntry = (newEntry: Omit<MapEntry, 'id' | 'uploadDate'>) => {
    const entryWithId: MapEntry = {
      ...newEntry,
      id: `map_${Date.now()}`,
      uploadDate: new Date().toISOString(),
    };
    setMapEntries(prevEntries => [entryWithId, ...prevEntries]);
  };

  const deleteMapEntry = (id: string) => {
    setMapEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
  };
  
  const updateMapEntry = (updatedEntry: MapEntry) => {
    setMapEntries(prevEntries => 
      prevEntries.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry)
    );
  };

  const filteredEntries = mapEntries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen text-gray-100 font-sans relative isolate overflow-hidden">
      {/* Background Aurora Blobs */}
      <div className="aurora-bg top-[-20%] left-[10%] w-[400px] h-[400px] bg-gradient-to-br from-violet-600 to-indigo-800" style={{ animationDelay: '2s' }}></div>
      <div className="aurora-bg top-[30%] right-[5%] w-[500px] h-[500px] bg-gradient-to-br from-pink-500 to-purple-700"></div>
      <div className="aurora-bg bottom-[-10%] left-[25%] w-[300px] h-[300px] bg-gradient-to-br from-blue-500 to-cyan-600" style={{ animationDelay: '4s' }}></div>
      
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <MapUploadForm onAddEntry={addMapEntry} />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight gradient-text">
              Database Entries
            </h2>
            <div className="space-y-8">
              {mapEntries.length > 0 ? (
                filteredEntries.length > 0 ? (
                  filteredEntries.map(entry => (
                    <MapEntryCard 
                      key={entry.id} 
                      entry={entry} 
                      onDelete={deleteMapEntry}
                      onUpdate={updateMapEntry}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 px-6 bg-gray-900/50 border border-gray-500/30 rounded-2xl backdrop-blur-sm">
                    <h3 className="text-xl font-semibold text-gray-300">No Results Found</h3>
                    <p className="mt-2 text-gray-400">
                      Your search for "<span className="font-medium text-gray-200">{searchQuery}</span>" did not match any entries.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-16 px-6 bg-gray-900/50 border border-gray-500/30 rounded-2xl backdrop-blur-sm">
                  <h3 className="text-xl font-semibold text-gray-300">No Entries Yet</h3>
                  <p className="mt-2 text-gray-400">
                    Upload your first map entry using the form on the left.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
