import { ModalService } from '@core/services/modal.service';
import { UserService } from '@core/services/user.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/services/auth.service';
import { EMPTY, filter, shareReplay, switchMap, take } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { CalendarModule } from 'primeng/calendar';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DialogType } from '@shared/models/dialog.type';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { UsernameDialogComponent } from '@shared/components/username-dialog/username-dialog.component';
import { DescriptionDialogComponent } from '@shared/components/description-dialog/description-dialog.component';
import { IProfileForm } from '@shared/models/form.types';
import { ISocial } from '@shared/models/user.interface';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { SocialsDialogComponent } from '@shared/components/socials-dialog/socials-dialog.component';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    FileUploadModule,
    CalendarModule,
    ChipComponent,
  ],
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  loading = signal<boolean>(false);

  form: FormGroup<IProfileForm> = this.fb.group<IProfileForm>({
    description: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    birthday: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    socials: this.fb.array<FormControl<ISocial>>([], {
      validators: [Validators.required],
    }),
  });

  maxDate = new Date();
  minDate = new Date(1900, 1, 1);

  ngOnInit(): void {}

  openModal(type: DialogType): void {
    const config: DynamicDialogConfig = { header: '' };
    let component: any;

    switch (type) {
      case 'socials': {
        component = SocialsDialogComponent;
        config.header = 'Socials';
        break;
      }

      default: {
        component = null;
        break;
      }
    }

    this.modalService.showDialog(component, config);

    this.modalService.ref?.onClose.pipe(take(1)).subscribe((icon) => {
      console.log('Received icon', icon);
    });
  }
}
