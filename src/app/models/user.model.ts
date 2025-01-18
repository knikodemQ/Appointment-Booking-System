export interface User {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    isDoctor: boolean;
    gender: string;
    age?: number;
    specialization?: string;
  }