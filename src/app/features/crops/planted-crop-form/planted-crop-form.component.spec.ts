import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantedCropFormComponent } from './planted-crop-form.component';

describe('PlantedCropFormComponent', () => {
  let component: PlantedCropFormComponent;
  let fixture: ComponentFixture<PlantedCropFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantedCropFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantedCropFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
