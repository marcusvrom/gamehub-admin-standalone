import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StationManagement } from './station-management.component';

describe('StationManagement', () => {
  let component: StationManagement;
  let fixture: ComponentFixture<StationManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StationManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StationManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
