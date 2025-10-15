import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      gender: ['', Validators.required],
      age: [''],
      specialization: ['']
    });
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;

    const { email, password, ...additionalData } = this.registerForm.value;
    try {
      await this.authService.register(email, password, additionalData);
      this.router.navigate(['/']); // Przekierowanie po udanej rejestracji
    } catch (error: any) {
      this.errorMessage = error.message;
    }
  }
}