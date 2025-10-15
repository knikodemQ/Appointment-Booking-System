import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { CalendarService } from '../services/calendar.service';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css']
})
export class DoctorListComponent implements OnInit {
  doctors$!: Observable<User[]>;

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.doctors$ = this.calendarService.users$.pipe(
      map(users => users.filter(user => user.isDoctor === true))
    );
  }
}