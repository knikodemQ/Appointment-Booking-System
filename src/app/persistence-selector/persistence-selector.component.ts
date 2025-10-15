import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-persistence-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './persistence-selector.component.html',
  styleUrls: ['./persistence-selector.component.css']
})
export class PersistenceSelectorComponent implements OnInit {
  currentPersistence: 'LOCAL' | 'SESSION' | 'NONE' = 'LOCAL';
  message: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // aktualnie uzywany
  }

  setPersistence(mode: 'LOCAL' | 'SESSION' | 'NONE') {
    this.authService.setAuthPersistence(mode).then(() => {
      this.currentPersistence = mode;
      this.message = `Persystencja ustawiona na: ${mode}`;
    }).catch(error => {
      console.error('Błąd ustawiania persystencji:', error);
      this.message = 'Błąd podczas ustawiania persystencji.';
    });
  }
}