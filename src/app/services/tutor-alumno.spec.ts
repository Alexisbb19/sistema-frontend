import { TestBed } from '@angular/core/testing';

import { TutorAlumno } from './tutor-alumno';

describe('TutorAlumno', () => {
  let service: TutorAlumno;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TutorAlumno);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
