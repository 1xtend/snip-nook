import { Injectable } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AuthModalComponent } from '../components/auth-modal/auth-modal.component';

@Injectable({
  providedIn: 'root',
})
export class AuthModalService {
  private modalRef: DynamicDialogRef | undefined = undefined;
  private logIn: boolean = true;

  set setLogIn(value: boolean) {
    this.logIn = value;
  }

  get getLogIn(): boolean {
    return this.logIn;
  }

  constructor(private dialogService: DialogService) {}

  showModal(): void {
    this.modalRef = this.dialogService.open(AuthModalComponent, {
      modal: true,
      draggable: false,
      width: '50vw',
      header: this.logIn ? 'Log In' : 'Sign Up',
    });
  }
}
