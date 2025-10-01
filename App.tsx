import React, { useState, useEffect, useCallback } from 'react';
import type { MapEntry } from './types';
import { Header } from './components/Header';
import { MapUploadForm } from './components/MapUploadForm';
import { MapEntryCard } from './components/MapEntryCard';
import * as api from './services/api';
import { LoadingSpinner } from './components/IconComponents';

const App: React.FC = () => {
  const [mapEntries, setMapEntries] = useState<MapEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const entries = await api.getMapEntries();
      setMapEntries(entries);
    } catch (err) {
      console.error("Failed to fetch entries:", err);
      setError("Could not load database entries. Please try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addMapEntry = async (newEntryData: { title: string, description: string, previewImageFile: File, associatedFiles: File[] }) => {
    try {
      await api.addMapEntry(newEntryData);
      await fetchEntries(); // Refetch to update the list
    } catch (err) {
      console.error("Failed to add entry:", err);
      setError("Failed to save the new entry. Please try again.");
      throw err; // Re-throw to allow form to handle its state
    }
  };

  const deleteMapEntry = async (id: string) => {
    try {
      await api.deleteMapEntry(id);
      await fetchEntries(); // Refetch to update the list
    } catch (err) {
      console.error("Failed to delete entry:", err);
      setError("Failed to delete the entry. Please try again.");
    }
  };
  
  const updateMapEntry = async (updatedEntry: MapEntry) => {
     try {
      await api.updateMapEntry(updatedEntry);
      await fetchEntries(); // Refetch to update the list
    } catch (err) {
      console.error("Failed to update entry:", err);
      setError("Failed to update the entry. Please try again.");
    }
  };

  const filteredEntries = mapEntries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-gray-900/50 border border-gray-500/30 rounded-2xl backdrop-blur-sm">
            <LoadingSpinner className="h-12 w-12 text-violet-400 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-300 mt-4">Loading Database...</h3>
        </div>
      );
    }

    if (error) {
       return (
        <div className="text-center py-16 px-6 bg-red-900/50 border border-red-500/30 rounded-2xl backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-red-300">An Error Occurred</h3>
            <p className="mt-2 text-red-400">{error}</p>
        </div>
       )
    }

    if (mapEntries.length === 0) {
      return (
        <div className="text-center py-16 px-6 bg-gray-900/50 border border-gray-500/30 rounded-2xl backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-gray-300">No Entries Yet</h3>
          <p className="mt-2 text-gray-400">
            Upload your first map entry using the form on the left.
          </p>
        </div>
      );
    }
    
    if (filteredEntries.length === 0) {
      return (
        <div className="text-center py-16 px-6 bg-gray-900/50 border border-gray-500/30 rounded-2xl backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-gray-300">No Results Found</h3>
          <p className="mt-2 text-gray-400">
            Your search for "<span className="font-medium text-gray-200">{searchQuery}</span>" did not match any entries.
          </p>
        </div>
      );
    }

    return filteredEntries.map(entry => (
      <MapEntryCard 
        key={entry.id} 
        entry={entry} 
        onDelete={deleteMapEntry}
        onUpdate={updateMapEntry}
      />
    ));
  };


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
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;