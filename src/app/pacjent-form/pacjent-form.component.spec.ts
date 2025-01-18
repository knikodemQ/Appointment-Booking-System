import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacjentFormComponent } from './pacjent-form.component';

describe('PacjentFormComponent', () => {
  let component: PacjentFormComponent;
  let fixture: ComponentFixture<PacjentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacjentFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacjentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
