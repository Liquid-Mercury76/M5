import type { MapEntry, StoredMapEntry, MapFile, StoredMapFile } from '../types';

const STORAGE_KEY = 'geodatabase_entries';
const SIMULATED_LATENCY = 500; // ms

// --- Helper Functions for File Handling ---

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const dataUrlToBlob = (dataUrl: string): Blob => {
    const parts = dataUrl.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
};


// --- Conversion between Stored and App-facing types ---

const storedFileToMapFile = (storedFile: StoredMapFile): MapFile => {
    return {
        ...storedFile,
        url: storedFile.data, // The data URL is used directly for src/href
        // Re-create file object for potential use (like in JSZip)
        file: new File([dataUrlToBlob(storedFile.data)], storedFile.name, { type: storedFile.type }),
    };
};

const mapFileToStoredFile = async (file: File): Promise<StoredMapFile> => {
    const data = await fileToBase64(file);
    return {
        id: `file_${Date.now()}_${Math.random()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        data,
    };
};

// --- API Functions ---

const getStoredEntries = (): StoredMapEntry[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error("Error reading from localStorage:", error);
        return [];
    }
};

const saveStoredEntries = (entries: StoredMapEntry[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
        console.error("Error writing to localStorage:", error);
    }
};

export const getMapEntries = async (): Promise<MapEntry[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const storedEntries = getStoredEntries();
            const mapEntries: MapEntry[] = storedEntries.map(entry => ({
                ...entry,
                previewImage: entry.previewImage ? storedFileToMapFile(entry.previewImage) : null,
                associatedFiles: entry.associatedFiles.map(storedFileToMapFile),
            }));
            // Sort by most recent
            resolve(mapEntries.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
        }, SIMULATED_LATENCY);
    });
};

export const addMapEntry = async (newEntryData: { title: string, description: string, previewImageFile: File, associatedFiles: File[] }): Promise<StoredMapEntry> => {
    return new Promise(async (resolve, reject) => {
        setTimeout(async () => {
            try {
                const storedPreviewImage = await mapFileToStoredFile(newEntryData.previewImageFile);
                const storedAssociatedFiles = await Promise.all(newEntryData.associatedFiles.map(mapFileToStoredFile));

                const entryToStore: StoredMapEntry = {
                    id: `map_${Date.now()}`,
                    uploadDate: new Date().toISOString(),
                    title: newEntryData.title,
                    description: newEntryData.description,
                    previewImage: storedPreviewImage,
                    associatedFiles: storedAssociatedFiles,
                };

                const allEntries = getStoredEntries();
                saveStoredEntries([entryToStore, ...allEntries]);
                resolve(entryToStore);
            } catch (error) {
                console.error("Failed to add map entry:", error);
                reject(error);
            }
        }, SIMULATED_LATENCY);
    });
};

export const deleteMapEntry = async (id: string): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let allEntries = getStoredEntries();
            allEntries = allEntries.filter(entry => entry.id !== id);
            saveStoredEntries(allEntries);
            resolve();
        }, SIMULATED_LATENCY);
    });
};

// Update function is not implemented in the UI yet.
export const updateMapEntry = async (updatedEntry: MapEntry): Promise<MapEntry> => {
     return new Promise(resolve => {
        setTimeout(() => {
             console.warn("updateMapEntry is a stub and does not handle file updates.");
             let allEntries = getStoredEntries();
             const index = allEntries.findIndex(e => e.id === updatedEntry.id);
             if (index > -1) {
                 const existingEntry = allEntries[index];
                 allEntries[index] = {
                     ...existingEntry,
                     title: updatedEntry.title,
                     description: updatedEntry.description,
                 };
                 saveStoredEntries(allEntries);
             }
             resolve(updatedEntry);
        }, SIMULATED_LATENCY);
    });
};
