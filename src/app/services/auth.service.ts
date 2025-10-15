import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from '@angular/fire/auth';
import { Database } from '@angular/fire/database';
import { ReplaySubject } from 'rxjs';
import { User } from '../models/user.model';
import { PatientService } from './patient.service';
import { PacjentFormService } from './pacjent-form.service';
import { signInWithPopup, setPersistence as firebaseSetPersistence, signInAnonymously, browserLocalPersistence, browserSessionPersistence } from '@angular/fire/auth';
import { setPersistence, inMemoryPersistence } from '@angular/fire/auth';


import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new ReplaySubject<User | null>(1);
  user$ = this.userSubject.asObservable();

  constructor(
    private auth: Auth,
    private db: Database,
    private patientService: PatientService,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, user => {
      if (user) {
        console.log('Użytkownik zalogowany:', user.uid);
        this.patientService.getUserById(user.uid).subscribe({
          next: (dbUser) => {
            if (dbUser) {
              console.log('Dane użytkownika z bazy:', dbUser);
            } else {
              console.warn('Brak danych użytkownika w bazie dla uid:', user.uid);
            }
            this.userSubject.next(dbUser ?? null);
          },
          error: (error) => {
            console.error('Błąd podczas pobierania danych użytkownika:', error);
            this.userSubject.next(null);
          }
        });
      } else {
        console.log('Użytkownik wylogowany');
        this.userSubject.next(null);
      }
    });
  }

  async register(email: string, password: string, additionalData: Partial<User>): Promise<UserCredential> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      if (credential.user) {
        const uid = credential.user.uid;
        const user: Partial<User> = {
          firstName: additionalData.firstName || '',
          lastName: additionalData.lastName || '',
          email: email,
          isDoctor: false, // Domyślnie
          gender: additionalData.gender || '',
          age: additionalData.age,
          specialization: additionalData.specialization || '',
          admin: false // Domyślnie
        };
        const newUser = await this.patientService.createUser(uid, user).toPromise();
        console.log('Nowy użytkownik utworzony:', newUser);
        this.userSubject.next(newUser ?? null);
        return credential;
      }
      throw new Error('Rejestracja użytkownika nie powiodła się');
    } catch (error: any) {
      console.error('Błąd podczas rejestracji:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error: any) {
      console.error('Błąd podczas logowania:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.userSubject.next(null);
      this.router.navigate(['/']); 
    } catch (error: any) {
      console.error('Błąd podczas wylogowania:', error);
      // Opcjonalnie 
    }
  }

  async setAuthPersistence(persistence: 'LOCAL' | 'SESSION' | 'NONE'): Promise<void> {
    let firebasePersistence;

    switch (persistence) {
      case 'LOCAL':
        firebasePersistence = browserLocalPersistence;
        break;
      case 'SESSION':
        firebasePersistence = browserSessionPersistence;
        break;
      case 'NONE':
        firebasePersistence = inMemoryPersistence;
        break;
      default:
        firebasePersistence = browserLocalPersistence;
    }

    try {
      await firebaseSetPersistence(this.auth, firebasePersistence);
      console.log(`Persystencja ustawiona na: ${persistence}`);
    } catch (error) {
      console.error('Błąd podczas ustawiania persystencji:', error);
      throw error;
    }
  }

  
}