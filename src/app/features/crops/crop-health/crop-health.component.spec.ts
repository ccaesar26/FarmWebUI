import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropHealthComponent } from './crop-health.component';

describe('CropHealthComponent', () => {
  let component: CropHealthComponent;
  let fixture: ComponentFixture<CropHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CropHealthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CropHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
