import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskMonitorBoardComponent } from './task-monitor-board.component';

describe('TaskMonitorBoardComponent', () => {
  let component: TaskMonitorBoardComponent;
  let fixture: ComponentFixture<TaskMonitorBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskMonitorBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskMonitorBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
