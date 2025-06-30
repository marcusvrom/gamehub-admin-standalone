import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameLibrary } from './game-library.component';

describe('GameLibrary', () => {
  let component: GameLibrary;
  let fixture: ComponentFixture<GameLibrary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameLibrary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameLibrary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
