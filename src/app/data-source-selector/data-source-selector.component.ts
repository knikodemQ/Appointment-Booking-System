import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Database, ref, set, get, child, update, remove, push } from '@angular/fire/database';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CalendarService } from '../services/calendar.service';

import { User } from '../models/user.model';
import { Absence } from '../models/absence.model';
import { Availability } from '../models/availability.model';
import { Appointment } from './../models/appointment.model';

@Component({
  selector: 'app-data-source-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-source-selector.component.html',
  styleUrls: ['./data-source-selector.component.css']
})
export class DataSourceSelectorComponent implements OnInit {
  appointments$: Observable<Appointment[]> = new Observable<Appointment[]>();
  users$: Observable<User[]> = new Observable<User[]>();
  availabilities$: Observable<Availability[]> = new Observable<Availability[]>();
  absences$: Observable<Absence[]> = new Observable<Absence[]>();

  newAppointment: Partial<Appointment> = {};
  newUser: Partial<User> = {};
  newAvailability: Partial<Availability> = {};
  newAbsence: Partial<Absence> = {};

  dataSource: string | null = null;
  
  // Zarządzanie formularzami
  showAddForm: { [key: string]: boolean } = {
    'appointments': false,
    'users': false,
    'availability': false,
    'absences': false
  };

  constructor(
    private router: Router, 
    private db: Database, 
    private calendarService: CalendarService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.dataSource = localStorage.getItem('dataSource');
    if (this.dataSource === 'firebase') {
      this.loadFirebaseData();
    } else if (this.dataSource === 'mongodb') {
      this.loadMongoData();
    }
  }

  selectDataSource(source: string) {
    localStorage.setItem('dataSource', source);
    this.dataSource = source;
    
    // Clear previous status
    this.mongoStatus = '';
    this.mongoMessage = '';
    
    // Ładowanie odpowiednich danych w zależności od źródła
    if (source === 'firebase') {
      this.loadFirebaseData();
    } else if (source === 'mongodb') {
      this.loadMongoData();
    }
    
    this.calendarService.loadAllData();
    this.router.navigate(['/data-source-selector']);
  }

  onRegisterDoctor() {
    this.router.navigate(['/register-doctor']);
  }

  toggleAddForm(formType: string) {
    this.showAddForm[formType] = !this.showAddForm[formType];
    
    // Reset form data when opening
    if (this.showAddForm[formType]) {
      switch (formType) {
        case 'appointments':
          this.newAppointment = {};
          break;
        case 'users':
          this.newUser = {};
          break;
        case 'availability':
          this.newAvailability = {};
          break;
        case 'absences':
          this.newAbsence = {};
          break;
      }
    }
  }

  loadFirebaseData() {
    this.appointments$ = this.getFirebaseCollection<Appointment>('appointments');
    this.users$ = this.getFirebaseCollection<User>('users');
    this.availabilities$ = this.getFirebaseCollection<Availability>('availability');
    this.absences$ = this.getFirebaseCollection<Absence>('absences');
  }

  getFirebaseCollection<T>(collection: string): Observable<T[]> {
    return from(get(child(ref(this.db), collection))).pipe(
      map(snapshot => {
        const data = snapshot.val();
        return data ? Object.values(data) as T[] : [];
      })
    );
  }

  addFirebaseItem<T>(collection: string, item: T): Observable<void> {
    const newItemRef = push(ref(this.db, collection));
    const newItem = { ...item, uid: newItemRef.key };
    return from(set(newItemRef, newItem));
  }

  updateFirebaseItem<T>(collection: string, uid: string, item: Partial<T>): Observable<void> {
    return from(update(ref(this.db, `${collection}/${uid}`), item));
  }

  deleteFirebaseItem(collection: string, uid: string): Observable<void> {
    return from(remove(ref(this.db, `${collection}/${uid}`))).pipe(
      switchMap(() => {
        this.loadFirebaseData();
        return new Observable<void>(observer => {
          observer.next();
          observer.complete();
        });
      })
    );
  }

  addAppointment() {
    if (this.dataSource === 'firebase') {
      if (this.newAppointment.uid) {
        this.updateFirebaseItem('appointments', this.newAppointment.uid, this.newAppointment).subscribe(() => {
          this.newAppointment = {};
          this.loadFirebaseData();
        });
      } else {
        this.addFirebaseItem('appointments', this.newAppointment).subscribe(() => {
          this.newAppointment = {};
          this.loadFirebaseData();
        });
      }
    } else if (this.dataSource === 'mongodb') {
      if (this.newAppointment._id) {
        this.updateMongoItem('appointments', this.newAppointment._id, this.newAppointment).subscribe(() => {
          this.newAppointment = {};
          this.loadMongoData();
        });
      } else {
        this.addMongoItem('appointments', this.newAppointment).subscribe(() => {
          this.newAppointment = {};
          this.loadMongoData();
        });
      }
    }
  }

  editAppointment(appointment: Appointment) {
    this.newAppointment = { ...appointment };
  }

  addUser() {
    if (this.dataSource === 'firebase') {
      if (this.newUser.uid) {
        this.updateFirebaseItem('users', this.newUser.uid, this.newUser).subscribe(() => {
          this.newUser = {};
          this.loadFirebaseData();
        });
      } else {
        this.addFirebaseItem('users', this.newUser).subscribe(() => {
          this.newUser = {};
          this.loadFirebaseData();
        });
      }
    } else if (this.dataSource === 'mongodb') {
      if (this.newUser._id) {
        this.updateMongoItem('users', this.newUser._id, this.newUser).subscribe(() => {
          this.newUser = {};
          this.loadMongoData();
        });
      } else {
        this.addMongoItem('users', this.newUser).subscribe(() => {
          this.newUser = {};
          this.loadMongoData();
        });
      }
    }
  }

  editUser(user: User) {
    this.newUser = { ...user };
  }

  addAvailability() {
    if (this.dataSource === 'firebase') {
      if (this.newAvailability.uid) {
        this.updateFirebaseItem('availability', this.newAvailability.uid, this.newAvailability).subscribe(() => {
          this.newAvailability = {};
          this.loadFirebaseData();
        });
      } else {
        this.addFirebaseItem('availability', this.newAvailability).subscribe(() => {
          this.newAvailability = {};
          this.loadFirebaseData();
        });
      }
    } else if (this.dataSource === 'mongodb') {
      if (this.newAvailability._id) {
        this.updateMongoItem('availability', this.newAvailability._id, this.newAvailability).subscribe(() => {
          this.newAvailability = {};
          this.loadMongoData();
        });
      } else {
        this.addMongoItem('availability', this.newAvailability).subscribe(() => {
          this.newAvailability = {};
          this.loadMongoData();
        });
      }
    }
  }

  editAvailability(availability: Availability) {
    this.newAvailability = { ...availability };
  }

  addAbsence() {
    if (this.dataSource === 'firebase') {
      if (this.newAbsence.uid) {
        this.updateFirebaseItem('absences', this.newAbsence.uid, this.newAbsence).subscribe(() => {
          this.newAbsence = {};
          this.loadFirebaseData();
        });
      } else {
        this.addFirebaseItem('absences', this.newAbsence).subscribe(() => {
          this.newAbsence = {};
          this.loadFirebaseData();
        });
      }
    } else if (this.dataSource === 'mongodb') {
      if (this.newAbsence._id) {
        this.updateMongoItem('absences', this.newAbsence._id, this.newAbsence).subscribe(() => {
          this.newAbsence = {};
          this.loadMongoData();
        });
      } else {
        this.addMongoItem('absences', this.newAbsence).subscribe(() => {
          this.newAbsence = {};
          this.loadMongoData();
        });
      }
    }
  }

  editAbsence(absence: Absence) {
    this.newAbsence = { ...absence };
  }

  // MongoDB properties
  mongoStatus: string = '';
  mongoMessage: string = '';
  private mongoApiUrl = 'http://localhost:3001/api';

  // MongoDB methods
  testMongoConnection() {
    this.http.get(`${this.mongoApiUrl}/test`).subscribe({
      next: (response: any) => {
        this.mongoStatus = 'success';
        this.mongoMessage = 'MongoDB Connected!';
        console.log('MongoDB test response:', response);
      },
      error: (error: any) => {
        this.mongoStatus = 'error';
        this.mongoMessage = 'MongoDB Connection Failed!';
        console.error('MongoDB test error:', error);
      }
    });
  }

  loadMongoData(collection?: string) {
    // Ładowanie wszystkich danych z MongoDB
    this.appointments$ = this.http.get<Appointment[]>(`${this.mongoApiUrl}/appointments`);
    this.users$ = this.http.get<User[]>(`${this.mongoApiUrl}/users`);
    this.availabilities$ = this.http.get<Availability[]>(`${this.mongoApiUrl}/availability`);
    this.absences$ = this.http.get<Absence[]>(`${this.mongoApiUrl}/absences`);
    
    // Używamy także CalendarService do ładowania danych MongoDB dla innych komponentów
    this.calendarService.loadAllData();
    this.mongoStatus = 'success';
    this.mongoMessage = collection ? `Loading ${collection} from MongoDB...` : 'Loading all data from MongoDB...';
  }

  // MongoDB methods
  addMongoItem<T>(collection: string, item: T): Observable<any> {
    return this.http.post(`${this.mongoApiUrl}/${collection}`, item);
  }

  updateMongoItem<T>(collection: string, id: string, item: Partial<T>): Observable<any> {
    return this.http.put(`${this.mongoApiUrl}/${collection}/${id}`, item);
  }

  deleteMongoItem(collection: string, id: string) {
    this.http.delete(`${this.mongoApiUrl}/${collection}/${id}`).subscribe({
      next: () => {
        console.log(`Deleted ${collection} item with id: ${id}`);
        this.loadMongoData(); // Reload data
      },
      error: (error: any) => {
        console.error(`Error deleting ${collection} item:`, error);
      }
    });
  }
}