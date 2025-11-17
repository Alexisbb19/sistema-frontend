import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisVuelos } from './mis-vuelos';

describe('MisVuelos', () => {
  let component: MisVuelos;
  let fixture: ComponentFixture<MisVuelos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisVuelos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisVuelos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
