import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoadingService } from '@core/services/loading.service';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [ProgressSpinnerModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderComponent {
  private loadingService = inject(LoadingService);

  loading = this.loadingService.loading;
}
