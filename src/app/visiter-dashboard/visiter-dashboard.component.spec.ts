import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisiterDashboardComponent } from './visiter-dashboard.component';

describe('VisiterDashboardComponent', () => {
  let component: VisiterDashboardComponent;
  let fixture: ComponentFixture<VisiterDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisiterDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisiterDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
