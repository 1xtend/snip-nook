import { Component, ViewChild } from '@angular/core';
import {
  FileUpload,
  FileUploadHandlerEvent,
  FileUploadModule,
} from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DialogService } from 'primeng/dynamicdialog';
import { EmailDialogComponent } from '@shared/components/email-dialog/email-dialog.component';
import { PasswordDialogComponent } from '@shared/components/password-dialog/password-dialog.component';
import { ModalService } from '@core/services/modal.service';
import { AuthService } from '@core/services/auth.service';
import { Observable, take } from 'rxjs';
import { User } from 'firebase/auth';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { DeleteDialogComponent } from '@shared/components/delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-user-settings',
  standalone: true,
  imports: [
    FileUploadModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    DividerModule,
    AsyncPipe,
    UpperCasePipe,
  ],
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
    private messageService: MessageService,
  ) {}

  uploadAvatar(e: FileUploadHandlerEvent) {
    console.log(e.files[0]);

    this.authService
      .updateAvatar(e.files[0])
      .pipe(take(1))
      .subscribe(() => {
        console.log('Uploaded image');
        this.fileUpload.clear();

        this.messageService.add({
          severity: 'success',
          detail: 'Avatar has been changed successfully',
          summary: 'Success',
        });
      });
  }

  showDialog(type: 'password' | 'email' | 'delete'): void {
    const header = type === 'delete' ? 'Delete account' : `Update your ${type}`;

    this.modalService.showDialog(
      header,
      type === 'email'
        ? EmailDialogComponent
        : type === 'password'
          ? PasswordDialogComponent
          : DeleteDialogComponent,
    );
  }
}
