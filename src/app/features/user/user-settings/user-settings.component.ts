import { UserUpdateService } from '../../../core/services/auth/user-update.service';
import { LoadingService } from './../../../core/services/loading.service';
import { Component, ViewChild } from '@angular/core';
import {
  FileUpload,
  FileUploadHandlerEvent,
  FileUploadModule,
} from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { EmailDialogComponent } from '@shared/components/email-dialog/email-dialog.component';
import { PasswordDialogComponent } from '@shared/components/password-dialog/password-dialog.component';
import { ModalService } from '@core/services/modal.service';
import { AuthService } from '@core/services/auth/auth.service';
import { Observable, take } from 'rxjs';
import { User } from 'firebase/auth';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [FileUploadModule, ButtonModule, AsyncPipe, UpperCasePipe],
  providers: [ModalService, DialogService],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.scss',
})
export class UserSettingsComponent {
  @ViewChild('fileUpload') fileUpload!: FileUpload;

  get user$(): Observable<User | undefined> {
    return this.authService.user$;
  }

  constructor(
    private modalService: ModalService,
    private authService: AuthService,
    private userUpdateService: UserUpdateService,
    private messageService: MessageService,
    private loadingService: LoadingService,
  ) {}

  uploadAvatar(e: FileUploadHandlerEvent) {
    this.loadingService.setLoading(true);

    this.userUpdateService
      .updateAvatar(e.files[0])
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.fileUpload.clear();

          this.messageService.add({
            severity: 'success',
            detail: 'Avatar has been changed successfully',
            summary: 'Success',
          });
        },
        error: (err) => {
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
    let header: string = '';
    let component: any = null;

    switch (type) {
      case 'password':
        header = 'Update your password';
        component = PasswordDialogComponent;

        break;
      case 'email':
        header = 'Update your email';
        component = EmailDialogComponent;

        break;
      case 'delete':
        header = 'Confirm';
        component = ConfirmDialogComponent;

        break;

      default:
        header = 'Dialog';
        component = null;
        break;
    }

    this.modalService.showDialog(header, component);
  }

  onDelete(): void {}
}
