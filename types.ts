
export interface MapFile {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  url: string; 
}

export interface MapEntry {
  id: string;
  title: string;
  description: string;
  uploadDate: string;
  previewImage: MapFile | null;
  associatedFiles: MapFile[];
}
