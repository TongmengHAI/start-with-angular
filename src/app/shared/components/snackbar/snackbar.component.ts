import { Component, Inject, inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'snackbar',
  template: '',
  styles: '  ',
  imports: [
    MatButtonModule,
    MatSnackBarLabel,
    MatSnackBarActions,
    MatSnackBarAction,
  ],
})
export class SnackbarTriggerComponent {
  private _snackBar = inject(MatSnackBar);
  durationInSeconds = 3;
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  openSnackBar() {
    this._snackBar.openFromComponent(Snackbar, {
      data: { message: 'H' },
      duration: this.durationInSeconds * 1000,

      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
}

@Component({
  selector: 'snackbar',
  templateUrl: './snackbar.component.html',
  styleUrl: './snackbar.component.scss',
  imports: [
    MatButtonModule,
    MatSnackBarLabel,
    MatSnackBarActions,
    MatSnackBarAction,
  ],
})
export class Snackbar {
  snackBarRef = inject(MatSnackBarRef);
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: { message: string }) {}
}


