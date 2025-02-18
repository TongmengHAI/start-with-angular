import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { MyModalComponent } from '../shared/components/my-modal/my-modal.component';

import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-visiter-dashboard',
  imports: [RouterModule, SharedModule],
  templateUrl: './visiter-dashboard.component.html',
  styleUrl: './visiter-dashboard.component.scss',
})
export class VisiterDashboardComponent {
  constructor(private dialog: MatDialog) {}

  openDialog(): void {
    const dialogRef = this.dialog.open(MyModalComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result:', result);
    });
  }
}
