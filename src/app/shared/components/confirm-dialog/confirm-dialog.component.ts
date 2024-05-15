import { ModalService } from '@core/services/modal.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  private modalService = inject(ModalService);

  onConfirm() {
    this.modalService.closeDialog();
    this.modalService.showDialog(DeleteDialogComponent, {
      header: 'Delete account',
    });
  }

  onDecline() {
    this.modalService.closeDialog();
  }
}
