import { ModalService } from '@core/services/modal.service';
import { UserService } from '@core/services/user.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DialogType } from '@shared/models/dialog.type';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { UsernameDialogComponent } from '@shared/components/username-dialog/username-dialog.component';
import { DescriptionDialogComponent } from '@shared/components/description-dialog/description-dialog.component';
import { IProfileForm, ISocialFormGroup } from '@shared/models/form.types';
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
    InputGroupModule,
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
  private cdr = inject(ChangeDetectorRef);

  private user$ = this.authService.user$;
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
    socials: this.fb.array<FormGroup<ISocialFormGroup>>(
      this.getSocialsArray(),
      { validators: [Validators.required, Validators.maxLength(5)] },
    ),
  });

  maxDate = new Date();
  minDate = new Date(1900, 1, 1);

  pending = signal<boolean>(false);

  get socialsArray() {
    return this.form.controls['socials'];
  }

  ngOnInit(): void {
    this.getUser();

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        console.log('Value changes: ', value);
      });
  }

  openModal(type: DialogType, data?: any): void {
    let config: DynamicDialogConfig = { header: '' };
    let component: any;

    switch (type) {
      case 'socials': {
        component = SocialsDialogComponent;
        config = {
          header: 'Socials',
          data,
        };
        break;
      }

      default: {
        component = null;
        break;
      }
    }

    this.modalService.showDialog(component, config);

    this.modalService.ref?.onClose.pipe(take(1)).subscribe((data) => {
      if (!data) return;

      const control = this.socialsArray.getRawValue()[data.index];
      this.socialsArray.setControl(
        data.index,
        this.createGroup({
          ...control,
          icon: data.icon || 'pi pi-link',
        }),
      );

      this.cdr.markForCheck();
    });
  }

  private getUser(): void {
    this.pending.set(true);
    this.form.disable();

    this.user$
      .pipe(
        take(1),
        switchMap((user) => {
          return user
            ? this.userService.getUser(user.uid).pipe(take(1))
            : EMPTY;
        }),
      )
      .subscribe({
        next: (user) => {
          // let socials = this.fb.array<FormControl<ISocial | null>>([]);

          // if (user?.socials) {
          //   socials = this.fb.array(
          //     user.socials.map((item) => {
          //       return this.fb.control<ISocial | null>(item, {
          //         nonNullable: true,
          //       });
          //     }),
          //   );
          // }

          // this.form.setControl('socials', socials);

          if (user?.socials) {
            this.form.setControl(
              'socials',
              this.setSocialsControl(user.socials),
            );
          }

          this.form.patchValue({
            description: user?.description || '',
            birthday: user?.birthday || '',
          });

          this.pending.set(false);
          this.form.enable();

          console.log(this.form.getRawValue());
        },
        error: () => {
          this.pending.set(false);
          this.form.enable();
        },
      });
  }

  private getSocialsArray(socials?: ISocial[]): FormGroup<ISocialFormGroup>[] {
    const groupsArray: FormGroup<ISocialFormGroup>[] = [];

    for (let i = 0; i < 5; i++) {
      groupsArray.push(this.createGroup(socials?.[i]));
    }

    return groupsArray;
  }

  private setSocialsControl(socials: ISocial[]) {
    return this.fb.array(this.getSocialsArray(socials));
  }

  private createGroup(social?: ISocial) {
    return this.fb.group<ISocialFormGroup>({
      icon: this.fb.control(social?.icon || '', { nonNullable: true }),
      name: this.fb.control(social?.name || '', { nonNullable: true }),
      link: this.fb.control(social?.link || '', { nonNullable: true }),
    });
  }
}
