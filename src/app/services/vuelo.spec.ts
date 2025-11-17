import { TestBed } from '@angular/core/testing';

import { Vuelo } from './vuelo';

describe('Vuelo', () => {
  let service: Vuelo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Vuelo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
