import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { AuthModalComponent } from './shared/components/auth-modal/auth-modal.component';
import { AuthModalService } from './shared/services/auth-modal.service';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, AuthModalComponent],
  providers: [AuthModalService, DialogService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(private authModalService: AuthModalService) {}

  showModal(): void {
    this.authModalService.showModal();
  }
}
