import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSignal = signal<boolean>(false);
  loading = computed(this.loadingSignal);

  setLoading(value: boolean): void {
    this.loadingSignal.set(value);
  }
}
