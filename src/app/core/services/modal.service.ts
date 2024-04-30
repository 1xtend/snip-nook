import { Injectable, inject } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private dialogService = inject(DialogService);

  ref: DynamicDialogRef | undefined = undefined;

  showDialog(header: string, component: any): void {
    this.ref = this.dialogService.open(component, {
      modal: true,
      header,
      width: '50vw',
      breakpoints: {
        '768px': '70vw',
        '480px': '90vw',
      },
    });
  }

  closeDialog() {
    this.ref?.close();
    this.ref = undefined;
  }
}
