import { LoadingService } from './../../../core/services/loading.service';
import {
  ChangeDetectionStrategy,
  Component,
  viewChild,
  inject,
} from '@angular/core';
import {
  FileUpload,
  FileUploadHandlerEvent,
  FileUploadModule,
} from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmailDialogComponent } from '@shared/components/email-dialog/email-dialog.component';
import { PasswordDialogComponent } from '@shared/components/password-dialog/password-dialog.component';
import { ModalService } from '@core/services/modal.service';
import { AuthService } from '@core/services/auth.service';
import { take } from 'rxjs';
import { UpperCasePipe } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UserService } from '@core/services/user.service';
import { DeleteDialogComponent } from '@shared/components/delete-dialog/delete-dialog.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [FileUploadModule, ButtonModule, UpperCasePipe, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSettingsComponent {
  private modalService = inject(ModalService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  public loadingService = inject(LoadingService);

  fileUpload = viewChild<FileUpload>('fileUpload');

  user = toSignal(this.authService.user$);

  uploadAvatar(e: FileUploadHandlerEvent) {
    this.loadingService.setLoading(true);

    this.userService
      .updateAvatar(e.files[0])
      .pipe(take(1))
      .subscribe({
        next: () => this.handleUploadNext(),
        error: (err) => this.handleUploadError(err),
      });
  }

  private handleUploadNext(): void {
    this.loadingService.setLoading(false);
    this.fileUpload()?.clear();
    this.messageService.add({
      severity: 'success',
      detail: 'Avatar has been changed successfully',
      summary: 'Success',
    });
  }

  private handleUploadError(error: Error): void {
    this.loadingService.setLoading(false);
  }

  confirm(e: MouseEvent): void {
    this.confirmationService.confirm({
      target: e.target as EventTarget,
      message: 'Do you want to delete your account?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: () => {
        this.confirmationService.close();
        this.showDialog('delete');
      },
      reject: () => {
        this.confirmationService.close();
      },
    });
  }

  showDialog(type: 'password' | 'email' | 'delete'): void {
    let config: DynamicDialogConfig = {};
    let component: any = null;

    switch (type) {
      case 'password':
        config = { header: 'Update your password' };
        component = PasswordDialogComponent;

        break;
      case 'email':
        config = { header: 'Update your email' };
        component = EmailDialogComponent;

        break;
      case 'delete':
        config = { header: 'Delete your account' };
        component = DeleteDialogComponent;

        break;

      default:
        config = { header: 'Dialog' };
        component = null;
        break;
    }

    this.modalService.showDialog(component, config);
  }
}
