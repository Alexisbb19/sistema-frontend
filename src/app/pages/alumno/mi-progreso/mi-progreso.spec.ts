import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiProgreso } from './mi-progreso';

describe('MiProgreso', () => {
  let component: MiProgreso;
  let fixture: ComponentFixture<MiProgreso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiProgreso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiProgreso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
