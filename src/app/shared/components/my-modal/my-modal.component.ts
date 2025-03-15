import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-my-dialog',
  imports: [MatDialogModule, SharedModule],
  templateUrl: './my-modal.component.html',
  styleUrl: './my-modal.component.scss',
})
export class MyModalComponent {
  constructor(private dialogRef: MatDialogRef<MyModalComponent>) {}

  close(): void {
    this.dialogRef.close('Dialog closed!');
  }
}
