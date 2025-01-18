import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
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
    endDate.setDate(endDate.getDate() + 1);

    const absence = {
      doctorId: 3, // simplicity doctorId 3
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      reason: this.absenceForm.get('reason')?.value
    };

    this.http.post('http://localhost:3000/absences', absence).subscribe(response => {
      console.log('Absence saved', response);
      this.router.navigate(['/calendar']);
    });
  }
}