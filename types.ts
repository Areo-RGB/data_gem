
export interface PlayerInfo {
  fullName: string;
  dob: string;
}

export interface PerformanceEntry {
  date: string;
  name: string;
  dob: string;
  team: string;
  drill: string;
  score: number;
  units: string;
  notes: string;
}

export interface ChartData {
  player: string;
  score: number;
  average: number;
}
