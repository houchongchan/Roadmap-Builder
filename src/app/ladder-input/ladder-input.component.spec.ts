import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LadderInputComponent } from './ladder-input.component';

describe('LadderInputComponent', () => {
  let component: LadderInputComponent;
  let fixture: ComponentFixture<LadderInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LadderInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LadderInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
