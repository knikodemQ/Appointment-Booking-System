import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AbsenceService } from '../services/absence.service';
import { Absence } from '../models/absence.model';

@Component({
  selector: 'app-define-absence',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './define-absence.component.html',
  styleUrls: ['./define-absence.component.css']
})
export class DefineAbsenceComponent implements OnInit {
  absenceForm: FormGroup;
  minDate: string = new Date().toISOString().split('T')[0]; 

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private absenceService: AbsenceService
  ) {
    this.absenceForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    const startDate = new Date(this.absenceForm.get('startDate')?.value);
    const endDate = new Date(this.absenceForm.get('endDate')?.value);

    // Sprawdzamy źródło danych i odpowiednio przygotowujemy absence
    const dataSource = localStorage.getItem('dataSource');
    
    if (dataSource === 'firebase' || dataSource === 'mongodb') {
      // Firebase i MongoDB - nie potrzebujemy generować ID
      const absence: Absence = {
        doctorId: 3, // simplicity doctorId 3
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        reason: this.absenceForm.get('reason')?.value
      };

      this.absenceService.createAbsence(absence).subscribe({
        next: (response) => {
          console.log('Absence saved', response);
          this.router.navigate(['/calendar']);
        },
        error: (err) => {
          console.error('Error saving absence', err);
        }
      });
    } else {
      // JSON Server - generujemy ID
      this.absenceService.getAbsences().subscribe(existingAbsences => {
        const existingIds = existingAbsences
          .map(a => a.id)
          .filter((id): id is number => typeof id === 'number');

        const newAbsenceId = existingIds.length > 0
          ? Math.max(...existingIds) + 1
          : 1;

        const absence: Absence = {
          id: newAbsenceId,
          doctorId: 3, // simplicity doctorId 3
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          reason: this.absenceForm.get('reason')?.value
        };

        this.absenceService.createAbsence(absence).subscribe({
          next: (response) => {
            console.log('Absence saved', response);
            this.router.navigate(['/calendar']);
          },
          error: (err) => {
            console.error('Error saving absence', err);
          }
        });
      });
    }
  }
}