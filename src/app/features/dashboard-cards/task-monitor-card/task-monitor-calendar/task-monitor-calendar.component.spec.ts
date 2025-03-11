import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskMonitorCalendarComponent } from './task-monitor-calendar.component';

describe('TaskMonitorCalendarComponent', () => {
  let component: TaskMonitorCalendarComponent;
  let fixture: ComponentFixture<TaskMonitorCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskMonitorCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskMonitorCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
