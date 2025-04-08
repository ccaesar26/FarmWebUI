import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantedCropsComponent } from './planted-crops.component';

describe('PlantedCropsComponent', () => {
  let component: PlantedCropsComponent;
  let fixture: ComponentFixture<PlantedCropsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantedCropsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantedCropsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
