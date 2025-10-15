import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Database, ref, get, child, set, push } from '@angular/fire/database';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Absence } from '../models/absence.model';

@Injectable({
  providedIn: 'root'
})
export class AbsenceService {
  private apiUrl = 'http://localhost:3000/absences';
  private mongoApiUrl = 'http://localhost:3001/api/absences';

  constructor(private http: HttpClient, private db: Database) {}

  private isFirebase(): boolean {
    return localStorage.getItem('dataSource') === 'firebase';
  }

  private isMongoDB(): boolean {
    return localStorage.getItem('dataSource') === 'mongodb';
  }

  private getNextId(collection: string): Observable<number> {
    return from(get(child(ref(this.db), collection))).pipe(
      map(snapshot => {
        const data = snapshot.val();
        const ids = data ? Object.keys(data).map(key => data[key].id || 0) : [];
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
      })
    );
  }

  getAbsences(): Observable<Absence[]> {
    if (this.isFirebase()) {
      const absencesRef = ref(this.db, 'absences');
      return from(get(absencesRef)).pipe(
        map(snapshot => {
          const data = snapshot.val();
          return data ? Object.values(data) as Absence[] : [];
        })
      );
    } else if (this.isMongoDB()) {
      return this.http.get<Absence[]>(this.mongoApiUrl);
    } else {
      return this.http.get<Absence[]>(this.apiUrl);
    }
  }

  createAbsence(absence: Absence): Observable<Absence> {
    if (this.isFirebase()) {
      const absencesRef = ref(this.db, 'absences');
      const newAbsenceRef = push(absencesRef);
      const newAbsence: Absence = { ...absence, uid: newAbsenceRef.key || undefined };
      return from(set(newAbsenceRef, newAbsence)).pipe(
        map(() => newAbsence)
      );
    } else if (this.isMongoDB()) {
      return this.http.post<Absence>(this.mongoApiUrl, absence);
    } else {
      return this.getNextId('absences').pipe(
        switchMap(id => {
          const newAbsence = { ...absence, id };
          return this.http.post<Absence>(this.apiUrl, newAbsence);
        })
      );
    }
  }

  updateAbsence(id: string | number, absence: Absence): Observable<Absence> {
    if (this.isFirebase()) {
      const absenceRef = ref(this.db, `absences/${id}`);
      return from(set(absenceRef, absence)).pipe(
        map(() => absence)
      );
    } else if (this.isMongoDB()) {
      return this.http.put<Absence>(`${this.mongoApiUrl}/${id}`, absence);
    } else {
      return this.http.put<Absence>(`${this.apiUrl}/${id}`, absence);
    }
  }

  deleteAbsence(id: string | number): Observable<void> {
    if (this.isFirebase()) {
      const absenceRef = ref(this.db, `absences/${id}`);
      return from(set(absenceRef, null));
    } else if (this.isMongoDB()) {
      return this.http.delete<void>(`${this.mongoApiUrl}/${id}`);
    } else {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
  }

  getAbsenceById(id: string | number): Observable<Absence> {
    if (this.isFirebase()) {
      const absenceRef = ref(this.db, `absences/${id}`);
      return from(get(absenceRef)).pipe(
        map(snapshot => snapshot.val() as Absence)
      );
    } else if (this.isMongoDB()) {
      return this.http.get<Absence>(`${this.mongoApiUrl}/${id}`);
    } else {
      return this.http.get<Absence>(`${this.apiUrl}/${id}`);
    }
  }
}