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
    return <ExcelIcon className="h-6 w-6 text-green-400 flex-shrink-0" />;
  }
  if (fileType.includes('octet-stream') || fileType.endsWith('.shp') || fileType.endsWith('.gdb')) {
    return <ShapefileIcon className="h-6 w-6 text-purple-400 flex-shrink-0" />;
  }
  if (fileType.startsWith('text/')) {
    return <TextFileIcon className="h-6 w-6 text-gray-400 flex-shrink-0" />;
  }
  return <GenericFileIcon className="h-6 w-6 text-blue-400 flex-shrink-0" />;
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
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/80 transition-colors">
        <div className="flex items-center space-x-4 min-w-0">
            <FileTypeIcon fileType={file.type} />
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
            </div>
        </div>
        <a 
            href={file.url} 
            download={file.name}
            className="ml-4 flex-shrink-0 inline-flex items-center justify-center h-9 w-9 border border-transparent text-sm font-medium rounded-full text-violet-300 bg-violet-900/30 hover:bg-violet-900/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-gray-900 transition-all"
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
    <article className="bg-gray-900/50 rounded-2xl shadow-2xl shadow-black/30 overflow-hidden border border-gray-500/30 backdrop-blur-sm transition-all hover:border-gray-500/50">
      <div className="grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-4 lg:col-span-4 relative group">
          {previewImage ? (
            <>
              <img 
                src={previewImage.url} 
                alt={title} 
                className="h-64 w-full object-cover md:h-full"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all"></div>
              <a
                href={previewImage.url}
                download={previewImage.name}
                className="absolute top-3 right-3 h-9 w-9 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-label="Download preview image"
                onClick={(e) => { if(previewImage.url === '#') e.preventDefault(); }}
              >
                <DownloadIcon className="h-5 w-5" />
              </a>
            </>
          ) : (
            <div className="h-64 md:h-full w-full bg-gray-800 flex items-center justify-center">
              <p className="text-gray-500">No Image</p>
            </div>
          )}
        </div>
        <div className="md:col-span-8 lg:col-span-8 p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h3 className="text-xl font-bold text-gray-100">{title}</h3>
              <p className="text-xs text-gray-400 mt-1">
                Uploaded on: {new Date(uploadDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
               <button onClick={() => alert('Edit functionality not yet implemented.')} className="p-2 text-gray-400 hover:text-violet-400 rounded-full hover:bg-gray-800/50 transition-colors">
                 <PencilIcon className="h-5 w-5"/>
               </button>
               <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-gray-800/50 transition-colors">
                 <TrashIcon className="h-5 w-5"/>
               </button>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-300 leading-relaxed">
            {description}
          </p>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-semibold text-gray-200">Associated Files</h4>
              {(associatedFiles.length > 0 || previewImage) && (
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-full shadow-lg shadow-violet-900/40 text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  aria-label="Download all files for this entry"
                >
                  <DownloadIcon className="h-4 w-4 mr-1.5" />
                  {isDownloading ? 'Zipping...' : 'Download All'}
                </button>
              )}
            </div>
            {associatedFiles.length > 0 ? (
                <div className="space-y-2">
                    {associatedFiles.map(file => <FileListItem key={file.id} file={file} />)}
                </div>
            ) : (
              <p className="text-sm text-gray-400 italic mt-2">No associated files for this entry.</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};