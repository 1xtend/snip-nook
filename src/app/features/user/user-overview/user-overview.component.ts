import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-overview',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './user-overview.component.html',
  styleUrl: './user-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserOverviewComponent implements OnInit {
  username: string = '';

  ngOnInit(): void {
    console.log(new URL('https://www.npmjs.com/~1xtend'));
  }

  getUsername() {
    const url = new URL('https://github.com/1xtend');
    return url.username;
  }
}
