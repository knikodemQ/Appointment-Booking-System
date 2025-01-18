export interface Appointment {
    appointmentId: number;
    doctorId: number;
    patientId: number;
    type: string;
    date: string;
    time: string;
    duration: number;
    occurred: boolean;
    cancelled: boolean;
    details: string;
  }