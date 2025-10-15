import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Database, ref, get, child, set, push } from '@angular/fire/database';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Availability } from '../models/availability.model';

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private apiUrl = 'http://localhost:3000/availability';
  private mongoApiUrl = 'http://localhost:3001/api/availability';

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

  getAvailabilities(): Observable<Availability[]> {
    if (this.isFirebase()) {
      const availabilityRef = ref(this.db, 'availability');
      return from(get(availabilityRef)).pipe(
        map(snapshot => {
          const data = snapshot.val();
          return data ? Object.values(data) as Availability[] : [];
        })
      );
    } else if (this.isMongoDB()) {
      return this.http.get<Availability[]>(this.mongoApiUrl);
    } else {
      return this.http.get<Availability[]>(this.apiUrl);
    }
  }

  createAvailability(availability: Availability): Observable<Availability> {
    if (this.isFirebase()) {
      const availabilityRef = ref(this.db, 'availability');
      const newAvailabilityRef = push(availabilityRef);
      const newAvailability: Availability = { ...availability, uid: newAvailabilityRef.key || undefined };
      return from(set(newAvailabilityRef, newAvailability)).pipe(
        map(() => newAvailability)
      );
    } else if (this.isMongoDB()) {
      return this.http.post<Availability>(this.mongoApiUrl, availability);
    } else {
      return this.getNextId('availability').pipe(
        switchMap(id => {
          const newAvailability = { ...availability, id };
          return this.http.post<Availability>(this.apiUrl, newAvailability);
        })
      );
    }
  }

  updateAvailability(id: string | number, availability: Availability): Observable<Availability> {
    if (this.isFirebase()) {
      const availabilityRef = ref(this.db, `availability/${id}`);
      return from(set(availabilityRef, availability)).pipe(
        map(() => availability)
      );
    } else if (this.isMongoDB()) {
      return this.http.put<Availability>(`${this.mongoApiUrl}/${id}`, availability);
    } else {
      return this.http.put<Availability>(`${this.apiUrl}/${id}`, availability);
    }
  }

  deleteAvailability(id: string | number): Observable<void> {
    if (this.isFirebase()) {
      const availabilityRef = ref(this.db, `availability/${id}`);
      return from(set(availabilityRef, null));
    } else if (this.isMongoDB()) {
      return this.http.delete<void>(`${this.mongoApiUrl}/${id}`);
    } else {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
  }

  getAvailabilityById(id: string | number): Observable<Availability> {
    if (this.isFirebase()) {
      const availabilityRef = ref(this.db, `availability/${id}`);
      return from(get(availabilityRef)).pipe(
        map(snapshot => snapshot.val() as Availability)
      );
    } else if (this.isMongoDB()) {
      return this.http.get<Availability>(`${this.mongoApiUrl}/${id}`);
    } else {
      return this.http.get<Availability>(`${this.apiUrl}/${id}`);
    }
  }

}