import { MessageService } from 'primeng/api';
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
import { ISocial, IUser, IUserProfile } from '@shared/models/user.interface';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { SocialsDialogComponent } from '@shared/components/socials-dialog/socials-dialog.component';
import { hasFormChangedValidator } from '@shared/validators/has-form-changed.validator';

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
  private messageService = inject(MessageService);

  private user$ = this.authService.user$;

  form: FormGroup<IProfileForm> = this.fb.group<IProfileForm>({
    description: this.fb.control('', {
      nonNullable: true,
    }),
    birthday: this.fb.control(null),
    socials: this.fb.array<FormGroup<ISocialFormGroup>>(
      this.getSocialGroupsArray(),
      { validators: [Validators.maxLength(5)] },
    ),
  });

  maxDate = new Date();
  minDate = new Date(1900, 1, 1);

  pending = signal<boolean>(false);
  loading = signal<boolean>(false);

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

  onSubmit(): void {
    if (this.form.invalid) return;

    this.form.disable();
    this.loading.set(true);

    const value = this.form.getRawValue();
    const profile: IUserProfile = {
      ...value,
      birthday: value.birthday?.toString(),
    };

    console.log('submit: ', this.form.getRawValue());

    this.updateProfile(profile);
  }

  private updateProfile(profile: IUserProfile): void {
    this.userService
      .updateProfile(profile)
      .pipe(take(1))
      .subscribe({
        next: () => {
          console.log('PROFILE WAS UPDATED');
          this.form.enable();
          this.loading.set(false);

          this.messageService.add({
            severity: 'success',
            detail: 'Profile settings have been changed successfully',
            summary: 'Success',
          });
        },
        error: () => {
          this.form.enable();
          this.loading.set(false);
        },
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
        this.createSocialGroup({
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
          console.log('get user: ', user);

          if (user?.socials) {
            this.form.setControl('socials', this.setSocialsArray(user.socials));
          }

          this.form.patchValue({
            description: user?.description || '',
            birthday: user?.birthday || null,
          });

          this.pending.set(false);
          this.form.enable();
          this.form.setValidators(
            hasFormChangedValidator(this.form.getRawValue()),
          );

          console.log(this.form.getRawValue());
        },
        error: () => {
          this.pending.set(false);
          this.form.enable();
        },
      });
  }

  private getSocialGroupsArray(
    socials?: ISocial[],
  ): FormGroup<ISocialFormGroup>[] {
    const groupsArray: FormGroup<ISocialFormGroup>[] = [];

    for (let i = 0; i < 5; i++) {
      groupsArray.push(this.createSocialGroup(socials?.[i]));
    }

    return groupsArray;
  }

  private setSocialsArray(socials: ISocial[]) {
    return this.fb.array(this.getSocialGroupsArray(socials));
  }

  private createSocialGroup(social?: ISocial) {
    return this.fb.group<ISocialFormGroup>({
      icon: this.fb.control(social?.icon || 'pi pi-link', {
        nonNullable: true,
      }),
      name: this.fb.control(social?.name || '', { nonNullable: true }),
      link: this.fb.control(social?.link || '', { nonNullable: true }),
    });
  }
}
