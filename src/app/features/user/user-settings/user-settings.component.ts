import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FileUpload,
  FileUploadEvent,
  FileUploadHandlerEvent,
  FileUploadModule,
} from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { EmailDialogComponent } from '@shared/components/email-dialog/email-dialog.component';
import { PasswordDialogComponent } from '@shared/components/password-dialog/password-dialog.component';
import { ModalService } from '@core/services/modal.service';
import { AuthService } from '@core/services/auth.service';
import { Observable, take } from 'rxjs';
import { User } from 'firebase/auth';
import { AsyncPipe } from '@angular/common';

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
  ) {}

  ngAfterViewInit(): void {}

  uploadAvatar(e: FileUploadHandlerEvent) {
    console.log(e.files[0]);

    this.authService
      .updateAvatar(e.files[0])
      .pipe(take(1))
      .subscribe(() => {
        console.log('Uploaded image');
        this.fileUpload.clear();
      });
  }

  showDialog(type: 'password' | 'email'): void {
    const header = `Update your ${type}`;

    this.modalService.showDialog(
      header,
      type === 'email' ? EmailDialogComponent : PasswordDialogComponent,
    );
  }
}
