import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { LocalStorageEnum } from '@shared/models/local-storage.enum';
import { ThemeType } from '@shared/models/theme.type';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);

  private activeThemeSubject = new BehaviorSubject<ThemeType | null>(null);
  activeTheme$ = this.activeThemeSubject.asObservable();

  get theme(): ThemeType | null {
    return localStorage.getItem(LocalStorageEnum.Theme) as ThemeType | null;
  }

  setTheme(theme: ThemeType): void {
    localStorage.setItem(LocalStorageEnum.Theme, theme);
    this.activeThemeSubject.next(theme);
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
