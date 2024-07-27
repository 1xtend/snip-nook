import { ModalService } from '@core/services/modal.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-update-avatar-dialog',
  standalone: true,
  imports: [ButtonModule, FileUploadModule, AvatarModule],
  templateUrl: './update-avatar-dialog.component.html',
  styleUrl: './update-avatar-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateAvatarDialogComponent implements OnInit {
  private dialogConfig = inject(DynamicDialogConfig);
  private modalService = inject(ModalService);

  url = signal<string | undefined>(undefined);

  ngOnInit(): void {
    this.url.set(this.dialogConfig.data);

    console.log('got data', this.dialogConfig.data);
  }
}
