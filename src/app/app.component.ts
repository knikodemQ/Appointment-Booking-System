import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { BasketService } from './services/basket.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  basketCount: number = 0;
  user$: Observable<User | null>;

  constructor(private route: ActivatedRoute, private router: Router, private basketService: BasketService, private authService: AuthService) {
    this.user$ = this.authService.user$;
    this.user$.subscribe(user => {
      console.log('Aktualny użytkownik:', user);
    });
  }

  ngOnInit(): void {
    localStorage.setItem('dataSource', 'firebase');
    this.basketService.basket$.subscribe(basket => {
      this.basketCount = basket.length;
    });
  }

  logout() {
    this.authService.logout();
  }
}