import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LoadingService } from '@core/services/loading.service';
import { ProgressBarModule } from 'primeng/progressbar';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [ProgressBarModule, AsyncPipe],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  get loading$(): Observable<boolean> {
    return this.loadingService.loading$;
  }

  constructor(private loadingService: LoadingService) {}
}
