import { TestBed } from '@angular/core/testing';

import { PacjentFormService } from './pacjent-form.service';

describe('PacjentFormService', () => {
  let service: PacjentFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PacjentFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
