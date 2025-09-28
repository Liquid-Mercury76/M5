import React, { useState, useCallback } from 'react';
import type { MapEntry, MapFile } from '../types';
import { UploadIcon, PlusCircleIcon, DocumentPlusIcon, XCircleIcon, CheckCircleIcon } from './IconComponents';
import { MAX_ASSOCIATED_FILES } from '../constants';

interface MapUploadFormProps {
  onAddEntry: (entry: Omit<MapEntry, 'id' | 'uploadDate'>) => void;
}

const createMapFile = (file: File): MapFile => ({
  id: `file_${Date.now()}_${Math.random()}`,
  file,
  name: file.name,
  type: file.type,
  size: file.size,
  url: URL.createObjectURL(file),
});

export const MapUploadForm: React.FC<MapUploadFormProps> = ({ onAddEntry }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewImage, setPreviewImage] = useState<MapFile | null>(null);
  const [associatedFiles, setAssociatedFiles] = useState<MapFile[]>([]);
  const [error, setError] = useState('');

  const handlePreviewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setPreviewImage(createMapFile(file));
        setError('');
      } else {
        setError('Preview file must be an image.');
      }
    }
  };

  const handleAssociatedFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map(createMapFile);
      setAssociatedFiles(prev => [...prev, ...newFiles].slice(0, MAX_ASSOCIATED_FILES));
    }
  };

  const removeAssociatedFile = (id: string) => {
    setAssociatedFiles(prev => prev.filter(f => f.id !== id));
  };
  
  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setPreviewImage(null);
    setAssociatedFiles([]);
    setError('');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !previewImage) {
      setError('Title and a preview image are required.');
      return;
    }
    
    onAddEntry({ title, description, previewImage, associatedFiles });
    resetForm();
  };

  return (
    <div className="bg-gray-900/50 p-6 rounded-2xl shadow-2xl shadow-black/30 border border-gray-500/30 sticky top-24 backdrop-blur-md">
      <h3 className="text-xl font-bold mb-5 flex items-center text-gray-100">
        <DocumentPlusIcon className="h-6 w-6 mr-2 text-violet-400" />
        Add New Entry
      </h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-800/60 text-gray-200 placeholder-gray-500 transition-all"
            placeholder="e.g., Lusaka Province Boundaries"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-gray-800/60 text-gray-200 placeholder-gray-500 transition-all"
            placeholder="A brief description of the map data..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Preview Image</label>
          <div className="mt-1 flex justify-center p-6 border-2 border-gray-700 border-dashed rounded-lg bg-gray-800/30 hover:border-gray-600 transition-colors">
            <div className="space-y-1 text-center">
              {previewImage ? (
                <>
                  <img src={previewImage.url} alt="Preview" className="mx-auto h-24 w-auto rounded-md object-contain" />
                  <p className="text-xs text-gray-400 truncate max-w-xs">{previewImage.name}</p>
                   <button type="button" onClick={() => setPreviewImage(null)} className="text-red-500 hover:text-red-400 text-xs font-semibold">Remove</button>
                </>
              ) : (
                <>
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                  <div className="flex text-sm text-gray-400">
                    <label htmlFor="preview-image-upload" className="relative cursor-pointer rounded-md font-medium text-violet-400 hover:text-violet-300 focus-within:outline-none">
                      <span>Upload an image</span>
                      <input id="preview-image-upload" name="preview-image-upload" type="file" className="sr-only" accept="image/*" onChange={handlePreviewImageChange} />
                    </label>
                  </div>
                   <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Associated Files ({associatedFiles.length}/{MAX_ASSOCIATED_FILES})</label>
           {associatedFiles.map(file => (
            <div key={file.id} className="flex items-center justify-between bg-gray-800/60 p-2 rounded-lg mb-2 text-sm">
                <span className="truncate text-gray-300 flex-1 pr-2">{file.name}</span>
                <button type="button" onClick={() => removeAssociatedFile(file.id)} className="flex-shrink-0">
                    <XCircleIcon className="h-5 w-5 text-gray-500 hover:text-red-500 transition-colors"/>
                </button>
            </div>
           ))}
          {associatedFiles.length < MAX_ASSOCIATED_FILES && (
            <label htmlFor="associated-files-upload" className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-600 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:border-violet-500 hover:text-violet-400 cursor-pointer transition-all">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Add Files
              <input id="associated-files-upload" name="associated-files-upload" type="file" multiple className="sr-only" onChange={handleAssociatedFileChange} />
            </label>
          )}
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg shadow-violet-900/50 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition-all" disabled={!title.trim() || !previewImage}>
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          Save Entry
        </button>
      </form>
    </div>
  );
};