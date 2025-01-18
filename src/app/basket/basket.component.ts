import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasketService } from '../services/basket.service';

interface Appointment {
  appointmentId: number;
  doctorId: number;
  patientId: number;
  type: string;
  date: string;
  time: string;
  duration: number;
  occurred: boolean;
  cancelled: boolean;
  details: string;
}

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.css']
})
export class BasketComponent implements OnInit {
  appointments: Appointment[] = [];

  constructor(private basketService: BasketService) {}

  ngOnInit(): void {
    this.basketService.basket$.subscribe(appointments => {
      this.appointments = appointments;
    });
  }

  removeAppointment(index: number): void {
    this.basketService.removeFromBasket(index);
  }

  simulatePayment(): void {
    alert('Płatność została pomyślnie zrealizowana!');
    this.basketService.clearBasket();
  }
}