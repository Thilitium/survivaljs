import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BarrackComponent } from './barrack.component';

describe('BarrackComponent', () => {
  let component: BarrackComponent;
  let fixture: ComponentFixture<BarrackComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BarrackComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarrackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
