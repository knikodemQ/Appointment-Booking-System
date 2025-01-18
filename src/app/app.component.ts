import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { BasketService } from './services/basket.service';
import { AngularFireModule } from "@angular/fire";
import { environment } from '../environments/environment'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  basketCount: number = 0;

  constructor(private route: ActivatedRoute, private router: Router, private basketService: BasketService) {}

  ngOnInit(): void {
    this.basketService.basket$.subscribe(basket => {
      this.basketCount = basket.length;
    });
  }
}