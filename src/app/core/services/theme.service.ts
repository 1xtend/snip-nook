import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { LocalStorageEnum } from '@shared/models/local-storage.enum';
import { ThemeType } from '@shared/models/theme.type';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document = inject(DOCUMENT);

  get theme(): ThemeType | null {
    return localStorage.getItem(LocalStorageEnum.Theme) as ThemeType | null;
  }

  setTheme(theme: ThemeType): void {
    localStorage.setItem(LocalStorageEnum.Theme, theme);
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
      this.setTheme('dark');
      this.switchTheme('dark');
    }
  }
}
