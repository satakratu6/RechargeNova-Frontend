import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSignal = signal<Theme>(this.getInitialTheme());
  theme = this.themeSignal.asReadonly();

  constructor() {
    effect(() => {
      const currentTheme = this.themeSignal();
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
      localStorage.setItem('recharge_nova_theme', currentTheme);
    });
  }

  toggleTheme(): void {
    this.themeSignal.update(t => t === 'light' ? 'dark' : 'light');
  }

  private getInitialTheme(): Theme {
    const saved = localStorage.getItem('recharge_nova_theme') as Theme;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
