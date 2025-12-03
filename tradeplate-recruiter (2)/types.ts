export enum CandidateStatus {
  NEW = 'New',
  SCREENING = 'Screening',
  HIRED = 'Hired',
  REJECTED = 'Rejected',
  CHURNED = 'Churned'
}

export enum AssetType {
  TRADE_PLATE = 'Trade Plate',
  FUEL_CARD = 'Fuel Card',
  TABLET = 'Tablet',
  UNIFORM = 'Uniform',
  DASH_CAM = 'Dash Cam',
  ID_BADGE = 'ID Badge',
  AA_CARD = 'AA Card'
}

export enum AssetStatus {
  AVAILABLE = 'Available',
  ALLOCATED = 'Allocated',
  MAINTENANCE = 'Maintenance',
  LOST = 'Lost'
}

export enum UserRole {
  ADMIN = 'Admin',
  RECRUITER = 'Recruiter',
  READ_ONLY = 'Read Only'
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  date: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
}

export interface HistoryLog {
  date: string;
  user: string; // User's initials
  event: string;
  details?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  mobile: string;
  age?: number;
  location: string;
  address?: string;
  postcode?: string;
  parkingStatus: string;
  licensePoints: string;
  drivingLicenseNumber?: string;
  niNumber?: string;
  utrNumber?: string;
  recruiterId?: string;
  
  nextOfKin?: {
    name: string;
    relationship: string;
    mobile: string;
  };

  bankDetails?: {
    bankName: string;
    sortCode: string;
    accountNumber: string;
    nameOnAccount: string;
  };

  experienceSummary: string;
  availability: string;
  financialStatus?: string;
  
  status: CandidateStatus;
  dbsStatus?: 'Not Started' | 'Requested' | 'Valid' | 'Expired';
  dbsExpiryDate?: string; // Added field
  contractSigned?: boolean;
  handbookIssued?: boolean;
  probationStatus?: 'Probation (46%)' | 'Standard (51%)';
  
  uniformSizes?: {
    polo: string;
    jacket: string;
    hiviz: string;
  };

  rating: number;
  notes: string;
  dateAdded: string;
  history: HistoryLog[];
  lat?: number;
  lng?: number;
}

export interface AssetLog {
  date: string;
  action: 'Allocated' | 'Returned' | 'Lost' | 'Maintenance';
  candidateName?: string;
  notes?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  replacementCost?: number;
  allocatedToCandidateId?: string;
  notes?: string;
  history: AssetLog[];
}

export interface ParseResult {
  candidate: Partial<Candidate>;
  rawText: string;
}

export const INITIAL_USERS: User[] = [
  { id: 'u-1', name: 'System Admin', email: 'admin@mvm-logistics.co.uk', role: UserRole.ADMIN, initials: 'SA' },
  { id: 'u-2', name: 'Viewer', email: 'view@mvm-logistics.co.uk', role: UserRole.READ_ONLY, initials: 'VI' },
  { id: 'u-3', name: 'STPJ Recruitment', email: 'contact@stpj.co.uk', role: UserRole.RECRUITER, initials: 'ST' },
  { id: 'u-4', name: 'TPJ Drivers', email: 'support@tpj.co.uk', role: UserRole.RECRUITER, initials: 'TP' },
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'c-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    mobile: '07700 900 123',
    age: 34,
    location: 'Manchester',
    parkingStatus: 'Driveway',
    licensePoints: '0',
    experienceSummary: '3 years at BCA',
    availability: 'Immediate',
    financialStatus: 'Financially stable',
    status: CandidateStatus.HIRED,
    rating: 5,
    probationStatus: 'Standard (51%)',
    contractSigned: true,
    handbookIssued: true,
    dbsStatus: 'Valid',
    dbsExpiryDate: '2025-06-15', // Sample Data
    notes: 'Excellent driver, very professional.',
    dateAdded: '2023-10-15T10:00:00Z',
    recruiterId: 'u-3',
    history: [
        { date: '2023-10-15T10:00:00Z', user: 'ST', event: 'Profile Created' },
        { date: '2023-10-16T11:00:00Z', user: 'SA', event: 'Status changed to Hired' }
    ],
    lat: 53.4808,
    lng: -2.2426,
  },
  {
    id: 'c-2',
    name: 'Mike Ross',
    email: 'm.ross@example.com',
    mobile: '07700 900 456',
    age: 25,
    location: 'Leeds',
    parkingStatus: 'Street',
    licensePoints: '3',
    experienceSummary: '1 year delivery driver',
    availability: '2 weeks notice',
    financialStatus: 'Requires weekly pay initially',
    status: CandidateStatus.CHURNED,
    rating: 3,
    probationStatus: 'Probation (46%)',
    notes: 'Left after 2 months due to commute.',
    dateAdded: '2023-09-01T10:00:00Z',
    dbsStatus: 'Expired',
    dbsExpiryDate: '2024-01-20', // Sample Data (expired)
    recruiterId: 'u-4',
    history: [
        { date: '2023-09-01T10:00:00Z', user: 'TP', event: 'Profile Created' },
        { date: '2023-11-01T14:00:00Z', user: 'SA', event: 'Status changed to Churned' }
    ],
    lat: 53.8008,
    lng: -1.5491,
  },
  {
    id: 'c-3',
    name: 'Jessica Pearson',
    email: 'j.pearson@example.com',
    mobile: '07700 900 789',
    age: 42,
    location: 'London',
    parkingStatus: 'Off-road',
    licensePoints: '0',
    experienceSummary: '5 years with logistics firms',
    availability: 'Immediate',
    status: CandidateStatus.SCREENING,
    rating: 5,
    notes: 'Strong candidate, pending final checks.',
    dateAdded: '2024-03-10T12:00:00Z',
    history: [{ date: '2024-03-10T12:00:00Z', user: 'SA', event: 'Profile Created' }],
    lat: 51.5072,
    lng: -0.1276,
  },
];

export const INITIAL_ASSETS: Asset[] = [
  { id: 'a-1', name: 'TP-299', type: AssetType.TRADE_PLATE, status: AssetStatus.ALLOCATED, allocatedToCandidateId: 'c-1', replacementCost: 180, history: [] },
  { id: 'a-2', name: 'TP-305', type: AssetType.TRADE_PLATE, status: AssetStatus.AVAILABLE, replacementCost: 180, history: [] },
  { id: 'a-3', name: 'FC-Shell-001', type: AssetType.FUEL_CARD, status: AssetStatus.ALLOCATED, allocatedToCandidateId: 'c-1', replacementCost: 50, history: [] },
  { id: 'a-4', name: 'Tab-Samsung-09', type: AssetType.TABLET, status: AssetStatus.AVAILABLE, replacementCost: 150, history: [] },
  { id: 'a-5', name: 'DC-NextBase-01', type: AssetType.DASH_CAM, status: AssetStatus.AVAILABLE, replacementCost: 155, history: [] },
];