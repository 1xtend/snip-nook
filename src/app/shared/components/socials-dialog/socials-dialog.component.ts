import { ModalService } from '@core/services/modal.service';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { socialsList } from '@shared/helpers/socials-list';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-socials-dialog',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './socials-dialog.component.html',
  styleUrl: './socials-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialsDialogComponent implements OnInit {
  private modalService = inject(ModalService);
  private dialogConfig = inject(DynamicDialogConfig);

  socials = socialsList;

  ngOnInit(): void {
    console.log(this.dialogConfig.data);
  }

  click(icon: string): void {
    this.modalService.closeDialog({
      icon,
      index: this.dialogConfig.data,
    });
  }
}
