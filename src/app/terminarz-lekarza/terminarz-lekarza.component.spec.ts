import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminarzLekarzaComponent } from './terminarz-lekarza.component';

describe('TerminarzLekarzaComponent', () => {
  let component: TerminarzLekarzaComponent;
  let fixture: ComponentFixture<TerminarzLekarzaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerminarzLekarzaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerminarzLekarzaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
