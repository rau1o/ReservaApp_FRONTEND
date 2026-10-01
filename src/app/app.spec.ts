import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('title signal tiene el valor correcto', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as unknown as { title: () => string };
    expect(app.title()).toBe('reservaapp-web');
  });
});
