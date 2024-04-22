import { ModalService } from '@core/services/modal.service';
import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  constructor(private modalService: ModalService) {}

  onConfirm() {
    this.modalService.closeDialog();
    this.modalService.showDialog('Delete account', DeleteDialogComponent);
  }

  onDecline() {
    this.modalService.closeDialog();
  }
}
