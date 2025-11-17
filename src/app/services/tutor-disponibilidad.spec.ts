import { TestBed } from '@angular/core/testing';

import { TutorDisponibilidad } from './tutor-disponibilidad';

describe('TutorDisponibilidad', () => {
  let service: TutorDisponibilidad;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TutorDisponibilidad);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
