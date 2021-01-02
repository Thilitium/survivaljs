import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreepComponent } from './creep.component';

describe('CreepComponent', () => {
  let component: CreepComponent;
  let fixture: ComponentFixture<CreepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
