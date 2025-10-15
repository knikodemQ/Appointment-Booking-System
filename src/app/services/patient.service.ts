import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Database, ref, get, set } from '@angular/fire/database';
import { Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://localhost:3000/users';
  private mongoApiUrl = 'http://localhost:3001/api/users';

  constructor(private http: HttpClient, private db: Database) {}

  private isFirebase(): boolean {
    return localStorage.getItem('dataSource') === 'firebase';
  }

  private isMongoDB(): boolean {
    return localStorage.getItem('dataSource') === 'mongodb';
  }

  getUsers(): Observable<User[]> {
    if (this.isFirebase()) {
      const usersRef = ref(this.db, 'users');
      return from(get(usersRef)).pipe(
        map(snapshot => {
          const data = snapshot.val();
          return data ? Object.values(data) as User[] : [];
        })
      );
    } else if (this.isMongoDB()) {
      return this.http.get<User[]>(this.mongoApiUrl);
    } else {
      return this.http.get<User[]>(this.apiUrl);
    }
  }

  /**
   * Tworzy użytkownika w Realtime Database używając UID z Firebase Auth jako klucza.
   * @param uid UID użytkownika z Firebase Auth
   * @param user Dane użytkownika
   */
  createUser(uid: string, user: Partial<User>): Observable<User> {
    if (this.isFirebase()) {
      const userRef = ref(this.db, `users/${uid}`);

      const newUser: User = { 
        uid: uid, 
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        isDoctor: user.isDoctor || false,
        admin: user.admin || false,
        gender: user.gender || '',
        age: user.age,
        specialization: user.specialization || ''
      };
      
      return from(set(userRef, newUser)).pipe(
        map(() => newUser),
        tap(() => {
          console.log('Użytkownik zapisany w Firebase z uid:', uid);
        })
      );
    } else {
      return this.http.post<User>(this.apiUrl, user);
    }
  }

  getUserById(uid: string): Observable<User | null> {
    if (this.isFirebase()) {
      const userRef = ref(this.db, `users/${uid}`);
      return from(get(userRef)).pipe(
        map(snapshot => snapshot.exists() ? snapshot.val() as User : null)
      );
    } else if (this.isMongoDB()) {
      return this.http.get<User[]>(this.mongoApiUrl).pipe(
        map(users => users.find(user => user.uid === uid) || null)
      );
    } else {
      return this.http.get<User>(`${this.apiUrl}/${uid}`);
    }
  }

  
}