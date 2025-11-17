import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Avionetas } from './avionetas';

describe('Avionetas', () => {
  let component: Avionetas;
  let fixture: ComponentFixture<Avionetas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Avionetas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Avionetas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
