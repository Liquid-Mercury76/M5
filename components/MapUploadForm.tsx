
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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 sticky top-24">
      <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800 dark:text-gray-100">
        <DocumentPlusIcon className="h-6 w-6 mr-2 text-blue-600 dark:text-blue-400" />
        Add New Entry
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            placeholder="e.g., Lusaka Province Boundaries"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            placeholder="A brief description of the map data..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preview Image</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {previewImage ? (
                <>
                  <img src={previewImage.url} alt="Preview" className="mx-auto h-24 w-auto rounded-md object-contain" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">{previewImage.name}</p>
                   <button type="button" onClick={() => setPreviewImage(null)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Remove</button>
                </>
              ) : (
                <>
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label htmlFor="preview-image-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload an image</span>
                      <input id="preview-image-upload" name="preview-image-upload" type="file" className="sr-only" accept="image/*" onChange={handlePreviewImageChange} />
                    </label>
                  </div>
                   <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Associated Files ({associatedFiles.length}/{MAX_ASSOCIATED_FILES})</label>
           {associatedFiles.map(file => (
            <div key={file.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-md mb-2 text-sm">
                <span className="truncate text-gray-700 dark:text-gray-300">{file.name}</span>
                <button type="button" onClick={() => removeAssociatedFile(file.id)}>
                    <XCircleIcon className="h-5 w-5 text-red-400 hover:text-red-600"/>
                </button>
            </div>
           ))}
          {associatedFiles.length < MAX_ASSOCIATED_FILES && (
            <label htmlFor="associated-files-upload" className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-400 dark:border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Add Files
              <input id="associated-files-upload" name="associated-files-upload" type="file" multiple className="sr-only" onChange={handleAssociatedFileChange} />
            </label>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50" disabled={!title.trim() || !previewImage}>
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          Save Entry
        </button>
      </form>
    </div>
  );
};
