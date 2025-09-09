
import type { MapEntry } from './types';

export const DUMMY_ENTRIES: MapEntry[] = [
  {
    id: 'map_1',
    title: 'Lusaka Province - District Boundaries',
    description: 'Detailed shapefile and associated data for the administrative boundaries of districts within Lusaka Province, Zambia. Updated as of Q2 2023.',
    uploadDate: new Date('2023-10-26T10:00:00Z').toISOString(),
    previewImage: {
      id: 'img_1',
      file: new File([], 'lusaka_map.png', { type: 'image/png' }),
      name: 'lusaka_map.png',
      type: 'image/png',
      size: 1200000,
      url: 'https://picsum.photos/seed/lusaka/800/600',
    },
    associatedFiles: [
      { id: 'file_1_1', file: new File([], 'Lusaka_Districts.shp'), name: 'Lusaka_Districts.shp', type: 'application/octet-stream', size: 450000, url: '#' },
      { id: 'file_1_2', file: new File([], 'District_Demographics.xlsx'), name: 'District_Demographics.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 120000, url: '#' },
      { id: 'file_1_3', file: new File([], 'Boundary_Metadata.txt'), name: 'Boundary_Metadata.txt', type: 'text/plain', size: 1500, url: '#' },
    ],
  },
  {
    id: 'map_2',
    title: 'Copperbelt - Mining Concessions',
    description: 'Geodatabase of all active and proposed mining concessions in the Copperbelt region. Includes operator data and concession expiry dates.',
    uploadDate: new Date('2023-11-15T14:30:00Z').toISOString(),
    previewImage: {
      id: 'img_2',
      file: new File([], 'copperbelt_map.png', { type: 'image/png' }),
      name: 'copperbelt_map.png',
      type: 'image/png',
      size: 2500000,
      url: 'https://picsum.photos/seed/copperbelt/800/600',
    },
    associatedFiles: [
      { id: 'file_2_1', file: new File([], 'CB_Concessions.gdb'), name: 'CB_Concessions.gdb', type: 'application/octet-stream', size: 15000000, url: '#' },
      { id: 'file_2_2', file: new File([], 'Operator_Contacts.csv'), name: 'Operator_Contacts.csv', type: 'text/csv', size: 85000, url: '#' },
    ],
  }
];

export const MAX_ASSOCIATED_FILES = 5;
