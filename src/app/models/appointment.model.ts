export interface Appointment {
  id?: number;        // Dla JSON Server
  uid?: string;       // Dla Firebase
  _id?: string;       // Dla MongoDB
  doctorId: number | string; // number dla JSON Server, string dla Firebase/MongoDB
  patientId: number | string; // number dla JSON Server, string dla Firebase/MongoDB
  type: string;
  date: string;
  time: string;
  duration: number;
  occurred: boolean;
  cancelled: boolean;
  details: string;
}