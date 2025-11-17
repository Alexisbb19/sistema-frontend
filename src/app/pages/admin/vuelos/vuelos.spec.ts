import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Vuelos } from './vuelos';

describe('Vuelos', () => {
  let component: Vuelos;
  let fixture: ComponentFixture<Vuelos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Vuelos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Vuelos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
