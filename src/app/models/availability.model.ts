export interface Availability {
    doctorId: number;
    type: string;
    startDate: string;
    endDate: string;
    days: string[];
    timeSlots: { from: string; to: string }[];
  }