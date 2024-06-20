import { ModalService } from '@core/services/modal.service';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { socialsList } from '@shared/helpers/socials-list';

@Component({
  selector: 'app-socials-dialog',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './socials-dialog.component.html',
  styleUrl: './socials-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialsDialogComponent implements OnInit {
  private modalService = inject(ModalService);

  socials = socialsList;

  ngOnInit(): void {}

  click(icon: string): void {
    console.log('icon', icon);
    this.modalService.closeDialog(icon);
  }
}
