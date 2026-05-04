import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial theme as light by default', () => {
    expect(service.theme()).toBe('light');
  });

  it('should toggle theme from light to dark', () => {
    service.toggleTheme();
    TestBed.flushEffects();
    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem('recharge_nova_theme')).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    service.toggleTheme(); // light -> dark
    TestBed.flushEffects();
    service.toggleTheme(); // dark -> light
    TestBed.flushEffects();
    expect(service.theme()).toBe('light');
    expect(localStorage.getItem('recharge_nova_theme')).toBe('light');
  });

  it('should load initial theme from localStorage', () => {
    localStorage.setItem('recharge_nova_theme', 'dark');
    // Re-create service to test initialization
    const newService = TestBed.runInInjectionContext(() => new ThemeService());
    expect(newService.theme()).toBe('dark');
  });

  it('should load initial theme as dark if prefers-color-scheme is dark', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: true,
        media: query,
      }),
    });
    
    const newService = TestBed.runInInjectionContext(() => new ThemeService());
    expect(newService.theme()).toBe('dark');
  });
});
