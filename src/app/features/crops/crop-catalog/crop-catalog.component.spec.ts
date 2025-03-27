import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropCatalogComponent } from './crop-catalog.component';

describe('CropCatalogComponent', () => {
  let component: CropCatalogComponent;
  let fixture: ComponentFixture<CropCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CropCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CropCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
