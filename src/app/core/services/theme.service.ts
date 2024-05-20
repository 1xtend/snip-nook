import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { LocalStorageEnum } from '@shared/models/local-storage.enum';
import { ThemeType } from '@shared/models/theme.type';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);

  private activeThemeSignal = signal<ThemeType | null>(null);
  activeTheme = computed(this.activeThemeSignal);

  get theme(): ThemeType | null {
    return localStorage.getItem(LocalStorageEnum.Theme) as ThemeType | null;
  }

  setTheme(theme: ThemeType): void {
    localStorage.setItem(LocalStorageEnum.Theme, theme);
    this.activeThemeSignal.set(theme);
  }

  switchTheme(theme: ThemeType) {
    let themeLink = this.document.getElementById(
      'app-theme',
    ) as HTMLLinkElement;

    if (themeLink) {
      themeLink.href = theme + '.css';
      this.setTheme(theme);
    }
  }

  checkSavedTheme(): void {
    if (this.theme) {
      this.switchTheme(this.theme);
    } else {
      this.switchTheme('dark');
    }
  }
}
