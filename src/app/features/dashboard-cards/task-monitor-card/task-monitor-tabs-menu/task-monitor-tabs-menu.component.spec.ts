import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskMonitorTabsMenuComponent } from './task-monitor-tabs-menu.component';

describe('TaskMonitorTabsMenuComponent', () => {
  let component: TaskMonitorTabsMenuComponent;
  let fixture: ComponentFixture<TaskMonitorTabsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskMonitorTabsMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskMonitorTabsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
