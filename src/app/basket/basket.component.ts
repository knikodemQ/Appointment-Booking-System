import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasketService } from '../services/basket.service';
import { User } from '../models/user.model';
import { Appointment } from './../models/appointment.model';
import { AuthService } from '../services/auth.service'; 

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.css']
})
export class BasketComponent implements OnInit {
  appointments: Appointment[] = [];
  user: User | null = null;

  constructor(private basketService: BasketService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });

    this.basketService.basket$.subscribe(appointments => {
      this.appointments = appointments;
    });
  }

  removeAppointment(appointmentId: string | undefined): void { 
    if (this.user && appointmentId) {
      this.basketService.removeFromBasketById(appointmentId);
    } else {
      console.log('Nie można usunąć wizyty: brak UID lub użytkownik niezalogowany.');
    }
  }

  simulatePayment(): void {
    alert('Płatność została pomyślnie zrealizowana!');
    this.basketService.clearBasket();
  }

  getAppointmentIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'pierwsza wizyta':
      case 'pierwsza-wizyta':
        return '1';
      case 'wizyta kontrolna':
      case 'wizyta-kontrolna':
        return 'K';
      case 'choroba przewlekła':
      case 'choroba-przewlekla':
        return 'P';
      case 'recepta':
        return 'R';
      default:
        return 'W';
    }
  }
}