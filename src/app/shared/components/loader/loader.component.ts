import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingService } from '@core/services/loading.service';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [ProgressBarModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  private loadingService = inject(LoadingService);

  loading = this.loadingService.loading;
}
