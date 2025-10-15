export interface Availability {
  id?: number;      // JSON Server
  uid?: string;     // Firebase
  _id?: string;     // MongoDB
  doctorId: number | string; // number dla JSON Server, string dla Firebase/MongoDB
  type: string;
  startDate: string;
  endDate: string;
  days: string[];
  timeSlots: { from: string; to: string }[];
}