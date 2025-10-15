export interface User {
  id?: number;        // Dla JSON Server
  uid?: string;       // Dla Firebase
  _id?: string;       // Dla MongoDB
  firstName: string;
  lastName: string;
  email: string;
  isDoctor: boolean;
  gender: string;
  age?: number;      
  specialization?: string; 
  admin?: boolean;
}