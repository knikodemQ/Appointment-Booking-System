import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersistenceSelectorComponent } from './persistence-selector.component';

describe('PersistenceSelectorComponent', () => {
  let component: PersistenceSelectorComponent;
  let fixture: ComponentFixture<PersistenceSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersistenceSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersistenceSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
