import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointOfSale } from './point-of-sale.component';

describe('PointOfSale', () => {
  let component: PointOfSale;
  let fixture: ComponentFixture<PointOfSale>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointOfSale]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointOfSale);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
