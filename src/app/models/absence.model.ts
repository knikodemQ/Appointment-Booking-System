export interface Absence {
  id?: number;      // Dla JSON Server
  uid?: string;     // Dla Firebase
  _id?: string;     // Dla MongoDB
  doctorId: number | string; // number dla JSON Server, string dla Firebase/MongoDB
  startDate: string;
  endDate: string;
  reason: string;
}