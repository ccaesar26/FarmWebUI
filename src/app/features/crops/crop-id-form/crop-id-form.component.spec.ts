import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropIdFormComponent } from './crop-id-form.component';

describe('CropIdFormComponent', () => {
  let component: CropIdFormComponent;
  let fixture: ComponentFixture<CropIdFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CropIdFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CropIdFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
