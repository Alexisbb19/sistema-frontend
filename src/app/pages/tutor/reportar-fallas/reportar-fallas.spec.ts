import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportarFallas } from './reportar-fallas';

describe('ReportarFallas', () => {
  let component: ReportarFallas;
  let fixture: ComponentFixture<ReportarFallas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportarFallas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportarFallas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
