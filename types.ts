export interface MapFile {
  id: string;
  file: File; // The actual file object, used in the UI and for uploads
  name: string;
  type: string;
  size: number;
  url: string; // Blob or Data URL for previews
}

export interface MapEntry {
  id: string;
  title: string;
  description: string;
  uploadDate: string;
  previewImage: MapFile | null;
  associatedFiles: MapFile[];
}

// Types for storing in localStorage (or a real DB)
// Files are stored as base64 strings
export interface StoredMapFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 data URL
}

export interface StoredMapEntry {
  id: string;
  title: string;
  description: string;
  uploadDate: string;
  previewImage: StoredMapFile | null;
  associatedFiles: StoredMapFile[];
}
