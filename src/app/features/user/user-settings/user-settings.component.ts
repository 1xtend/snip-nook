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
import { DialogService, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EmailDialogComponent } from '@shared/components/email-dialog/email-dialog.component';
import { PasswordDialogComponent } from '@shared/components/password-dialog/password-dialog.component';
import { ModalService } from '@core/services/modal.service';
import { AuthService } from '@core/services/auth.service';
import { take } from 'rxjs';
import { UpperCasePipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [FileUploadModule, ButtonModule, UpperCasePipe],
  providers: [],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSettingsComponent {
  private modalService = inject(ModalService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private loadingService = inject(LoadingService);

  fileUpload = viewChild<FileUpload>('fileUpload');

  user = this.authService.user;

  uploadAvatar(e: FileUploadHandlerEvent) {
    this.loadingService.setLoading(true);

    this.userService
      .updateAvatar(e.files[0])
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.fileUpload()?.clear();

          this.messageService.add({
            severity: 'success',
            detail: 'Avatar has been changed successfully',
            summary: 'Success',
          });
        },
        error: (err) => {
          console.log(err);

          this.messageService.add({
            severity: 'error',
            detail: 'Unexpected error occurred. Try again later',
            summary: 'Error',
          });

          this.loadingService.setLoading(false);
        },
        complete: () => {
          this.loadingService.setLoading(false);
        },
      });
  }

  showDialog(type: 'password' | 'email' | 'delete'): void {
    let config: DynamicDialogConfig;
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
        config = { header: 'Confirm deletion' };
        component = ConfirmDialogComponent;

        break;

      default:
        config = { header: 'Dialog' };
        component = null;
        break;
    }

    this.modalService.showDialog(component, config);
  }
}
