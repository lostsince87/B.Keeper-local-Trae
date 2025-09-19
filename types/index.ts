// Types for B.Keeper app

export interface Hive {
  id: string;
  name: string;
  location: string;
  type: string;
  isNucleus: boolean;
  createdAt: string;
  lastInspection?: string;
  status: 'critical' | 'warning' | 'excellent' | 'good' | 'active' | 'inactive' | 'swarmed';
  notes?: string;
  hasQueen?: boolean;
  queenMarked?: boolean;
  queenColor?: QueenColor;
  queenAddedDate?: string;
  queenWingClipped?: boolean;
  population?: string;
  varroa?: string;
  honey?: string;
  frames?: string;
  isWintered?: boolean;
  image?: string | null;
}

export interface Inspection {
  id: number;
  hive: string;
  date: string;
  time?: string;
  weather: string;
  temperature?: number;
  duration?: string;
  broodFrames: number;
  totalFrames: number;
  queenSeen: boolean | null;
  temperament?: string;
  varroaCount?: number | null;
  varroaDays?: number | null;
  varroaPerDay?: number | null;
  varroaLevel?: 'lågt' | 'normalt' | 'högt' | null;
  observations?: string[];
  customObservation?: string | null;
  notes: string;
  isWintering?: boolean;
  winterFeed?: number | null;
  isVarroaTreatment?: boolean;
  treatmentType?: string | null;
  newQueenAdded?: boolean;
  newQueenMarked?: boolean | null;
  newQueenColor?: string | null;
  newQueenWingClipped?: boolean | null;
  createdAt: string;
  rating?: number;
  findings: string[];
  aiAnalysis?: any;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  hive?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
  type: 'inspection' | 'treatment' | 'feeding' | 'maintenance' | 'other';
}

export interface Harvest {
  id: string;
  hive: string;
  date: string;
  amount: number;
  type: 'honey' | 'wax' | 'propolis';
  notes?: string;
}

export interface Settings {
  notifications: boolean;
  darkMode: boolean;
  language: string;
  units: 'metric' | 'imperial';
  autoBackup: boolean;
}

// Weather types
export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'cold';

// Color types for queen marking
export type QueenColor = 'white' | 'yellow' | 'red' | 'green' | 'blue';

// Treatment types
export type TreatmentType = 'varroa' | 'nosema' | 'foulbrood' | 'other';

// Special actions
export type SpecialAction = 'queen_marking' | 'queen_clipping' | 'supering' | 'feeding' | 'treatment';