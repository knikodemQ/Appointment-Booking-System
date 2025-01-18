import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';


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

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private basket: Appointment[] = [];
  private basketSubject = new BehaviorSubject<Appointment[]>(this.basket);

  basket$ = this.basketSubject.asObservable();

  constructor(private http: HttpClient) {
    const savedBasket = localStorage.getItem('basket');
    if (savedBasket) {
      this.basket = JSON.parse(savedBasket);
      this.basketSubject.next(this.basket);
    }
  }

  addToBasket(appointment: Appointment): void {
    this.basket.push(appointment);
    this.updateLocalStorage();
    this.basketSubject.next(this.basket);
  }

  removeFromBasket(index: number): void {
    const appointment = this.basket[index];
    this.basket.splice(index, 1);
    this.updateLocalStorage();
    this.basketSubject.next(this.basket);
    this.removeFromDatabase(appointment.appointmentId);
  }

  removeFromBasketById(appointmentId: number): void {
    this.basket = this.basket.filter(appointment => appointment.appointmentId !== appointmentId);
    this.updateLocalStorage();
    this.basketSubject.next(this.basket);
    this.removeFromDatabase(appointmentId);
  }

  clearBasket(): void {
    this.basket = [];
    this.updateLocalStorage();
    this.basketSubject.next(this.basket);
  }

  private updateLocalStorage(): void {
    localStorage.setItem('basket', JSON.stringify(this.basket));
  }

  private removeFromDatabase(appointmentId: number): void {
    this.http.delete(`http://localhost:3000/appointments/${appointmentId}`).subscribe();
  }
}