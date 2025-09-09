import React, { useState } from 'react';
import type { MapEntry, MapFile } from '../types';
import { DownloadIcon, ExcelIcon, ShapefileIcon, TextFileIcon, GenericFileIcon, TrashIcon, PencilIcon } from './IconComponents';

declare const JSZip: any;

interface MapEntryCardProps {
  entry: MapEntry;
  onDelete: (id: string) => void;
  onUpdate: (entry: MapEntry) => void; // Placeholder for future edit functionality
}

const FileTypeIcon: React.FC<{ fileType: string }> = ({ fileType }) => {
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
    return <ExcelIcon className="h-6 w-6 text-green-500 flex-shrink-0" />;
  }
  if (fileType.includes('octet-stream') || fileType.endsWith('.shp') || fileType.endsWith('.gdb')) {
    return <ShapefileIcon className="h-6 w-6 text-purple-500 flex-shrink-0" />;
  }
  if (fileType.startsWith('text/')) {
    return <TextFileIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />;
  }
  return <GenericFileIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />;
};

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const FileListItem: React.FC<{ file: MapFile }> = ({ file }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <div className="flex items-center space-x-3 min-w-0">
            <FileTypeIcon fileType={file.type} />
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatBytes(file.size)}</p>
            </div>
        </div>
        <a 
            href={file.url} 
            download={file.name}
            className="ml-4 flex-shrink-0 inline-flex items-center p-2 border border-transparent text-sm leading-4 font-medium rounded-full text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900"
            aria-label={`Download ${file.name}`}
            onClick={(e) => { if(file.url === '#') e.preventDefault(); /* Prevent dummy link navigation */ }}
        >
            <DownloadIcon className="h-5 w-5" />
        </a>
    </div>
);


export const MapEntryCard: React.FC<MapEntryCardProps> = ({ entry, onDelete, onUpdate }) => {
  const { id, title, description, uploadDate, previewImage, associatedFiles } = entry;
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
        onDelete(id);
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      if (typeof JSZip === 'undefined') {
        alert('A library required for zipping files (JSZip) is not available.');
        return;
      }
      const zip = new JSZip();
      
      const filesToZip: MapFile[] = [];
      if (previewImage) {
        filesToZip.push(previewImage);
      }
      filesToZip.push(...associatedFiles);
      
      if (filesToZip.length === 0) {
        alert("No files to download.");
        return;
      }

      const fetchPromises = filesToZip.map(file => {
        if (file.url === '#') {
          const placeholderContent = `This is a placeholder for the file: ${file.name}\nSize: ${formatBytes(file.size)}`;
          return Promise.resolve({ name: file.name, blob: new Blob([placeholderContent], { type: 'text/plain' }) });
        }
        return fetch(file.url)
          .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch ${file.name}. Status: ${response.statusText}`);
            return response.blob();
          })
          .then(blob => ({ name: file.name, blob }))
          .catch(err => {
            console.error(`Could not download ${file.name}:`, err);
            const errorContent = `Failed to download file: ${file.name}\nError: ${err.message}`;
            return { name: `DOWNLOAD_ERROR_${file.name}.txt`, blob: new Blob([errorContent], { type: 'text/plain' }) };
          });
      });

      const fileResults = await Promise.all(fetchPromises);
      
      fileResults.forEach(result => {
        zip.file(result.name, result.blob);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `${safeTitle}_files.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

    } catch (error) {
      console.error("Error creating zip file:", error);
      alert("An error occurred while creating the zip file.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-xl">
      <div className="grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-4 lg:col-span-4 relative group">
          {previewImage ? (
            <>
              <img 
                src={previewImage.url} 
                alt={title} 
                className="h-64 w-full object-cover md:h-full"
              />
              <a
                href={previewImage.url}
                download={previewImage.name}
                className="absolute top-3 right-3 p-2 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-label="Download preview image"
                onClick={(e) => { if(previewImage.url === '#') e.preventDefault(); }}
              >
                <DownloadIcon className="h-5 w-5" />
              </a>
            </>
          ) : (
            <div className="h-64 md:h-full w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <p className="text-gray-500">No Image</p>
            </div>
          )}
        </div>
        <div className="md:col-span-8 lg:col-span-8 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Uploaded on: {new Date(uploadDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
               <button onClick={() => alert('Edit functionality not yet implemented.')} className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                 <PencilIcon className="h-5 w-5"/>
               </button>
               <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                 <TrashIcon className="h-5 w-5"/>
               </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200">Associated Files</h4>
              {(associatedFiles.length > 0 || previewImage) && (
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Download all files for this entry"
                >
                  <DownloadIcon className="h-4 w-4 mr-1.5" />
                  {isDownloading ? 'Zipping...' : 'Download All'}
                </button>
              )}
            </div>
            {associatedFiles.length > 0 ? (
                <div className="space-y-3">
                    {associatedFiles.map(file => <FileListItem key={file.id} file={file} />)}
                </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No associated files for this entry.</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};