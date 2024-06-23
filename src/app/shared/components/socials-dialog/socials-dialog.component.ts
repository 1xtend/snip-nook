import { ModalService } from '@core/services/modal.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { socialsList } from '@shared/helpers/socials-list';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-socials-dialog',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './socials-dialog.component.html',
  styleUrl: './socials-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialsDialogComponent {
  private modalService = inject(ModalService);
  private dialogConfig = inject(DynamicDialogConfig);

  socials = socialsList;

  socialClick(icon: string): void {
    this.modalService.closeDialog({
      icon,
      index: this.dialogConfig.data,
    });
  }
}
