import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldsManagementComponent } from './fields-management.component';

describe('FieldsManagementComponent', () => {
  let component: FieldsManagementComponent;
  let fixture: ComponentFixture<FieldsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldsManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
