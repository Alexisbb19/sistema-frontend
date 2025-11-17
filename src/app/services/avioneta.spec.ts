import { TestBed } from '@angular/core/testing';

import { Avioneta } from './avioneta';

describe('Avioneta', () => {
  let service: Avioneta;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Avioneta);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
