import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

import { User } from '../models/user.model';
import { Absence } from '../models/absence.model';
import { Availability } from '../models/availability.model';
import { Appointment } from './../models/appointment.model';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    try {
      await this.authService.login(email, password);
      this.router.navigate(['/']); 
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}