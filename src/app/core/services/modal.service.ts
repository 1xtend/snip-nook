import { Injectable, inject } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { filter, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private dialogService = inject(DialogService);
  private router = inject(Router);

  ref: DynamicDialogRef | undefined = undefined;

  showDialog(component: any, config?: DynamicDialogConfig): void {
    if (!component) {
      return;
    }

    const dialogConfig: DynamicDialogConfig = {
      modal: true,
      width: '50vw',
      breakpoints: {
        '768px': '70vw',
        '480px': '90vw',
      },
      ...config,
    };

    this.ref = this.dialogService.open(component, dialogConfig);

    this.closeOnNavigate();
  }

  closeDialog() {
    this.ref?.close();
    this.ref = undefined;
  }

  private closeOnNavigate(): void {
    this.router.events
      .pipe(
        filter((events) => events instanceof NavigationStart),
        take(1),
      )
      .subscribe(() => {
        this.closeDialog();
      });
  }
}
