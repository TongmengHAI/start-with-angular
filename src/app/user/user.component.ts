import { Component, OnInit  } from '@angular/core';
import { UserService } from './user.service';
import { SharedModule } from '../shared/shared.module';
@Component({
  selector: 'app-user',
  imports: [SharedModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {
  users: any[] = [];
  loading = true;
  error = '';

  constructor(private userServiceApi: UserService) {}

  async ngOnInit() {
    try {
      this.users = await this.userServiceApi.getUsers();
    } catch (err) {
      this.error = 'Failed to load users!';
    } finally {
      this.loading = false;
    }
  }
}
