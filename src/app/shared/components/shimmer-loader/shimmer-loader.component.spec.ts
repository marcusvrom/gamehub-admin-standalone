import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShimmerLoader } from './shimmer-loader';

describe('ShimmerLoader', () => {
  let component: ShimmerLoader;
  let fixture: ComponentFixture<ShimmerLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShimmerLoader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShimmerLoader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
