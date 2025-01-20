import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitializeFarmComponent } from './initialize-farm.component';

describe('InitializeFarmComponent', () => {
  let component: InitializeFarmComponent;
  let fixture: ComponentFixture<InitializeFarmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitializeFarmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitializeFarmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
