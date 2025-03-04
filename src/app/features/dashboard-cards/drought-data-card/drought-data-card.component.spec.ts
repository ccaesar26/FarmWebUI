import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DroughtDataCardComponent } from './drought-data-card.component';

describe('DroughtDataCardComponent', () => {
  let component: DroughtDataCardComponent;
  let fixture: ComponentFixture<DroughtDataCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DroughtDataCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DroughtDataCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
