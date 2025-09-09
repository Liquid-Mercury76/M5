
import React, { useState } from 'react';
import type { MapEntry } from './types';
import { Header } from './components/Header';
import { MapUploadForm } from './components/MapUploadForm';
import { MapEntryCard } from './components/MapEntryCard';
import { DUMMY_ENTRIES } from './constants';

const App: React.FC = () => {
  const [mapEntries, setMapEntries] = useState<MapEntry[]>(DUMMY_ENTRIES);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <MapUploadForm onAddEntry={addMapEntry} />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              Database Entries
            </h2>
            <div className="space-y-6">
              {mapEntries.length > 0 ? (
                mapEntries.map(entry => (
                  <MapEntryCard 
                    key={entry.id} 
                    entry={entry} 
                    onDelete={deleteMapEntry}
                    onUpdate={updateMapEntry}
                  />
                ))
              ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Entries Yet</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">
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
