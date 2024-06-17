import { ModalService } from '@core/services/modal.service';
import { UserService } from '@core/services/user.service';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/services/auth.service';
import { EMPTY, filter, shareReplay, switchMap, take } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IProfileSettingsForm } from '@shared/models/forms.types';
import { DialogType } from '@shared/models/dialog.type';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { UsernameDialogComponent } from '@shared/components/username-dialog/username-dialog.component';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [ButtonModule, ReactiveFormsModule],
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private modalService = inject(ModalService);

  loading = signal<boolean>(false);

  ngOnInit(): void {}

  openModal(type: DialogType): void {
    const config: DynamicDialogConfig = { header: '' };
    let component: any;

    switch (type) {
      case 'username': {
        config.header = 'Username';
        component = UsernameDialogComponent;
        break;
      }

      default: {
        component = null;
        break;
      }
    }

    this.modalService.showDialog(component, config);
  }
}
