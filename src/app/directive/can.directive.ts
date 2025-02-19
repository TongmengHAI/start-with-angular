// directives/can.directive.ts
import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnDestroy,
} from '@angular/core';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[can]',
})
export class CanDirective implements OnDestroy {
  private permissions: string[] = [];
  private subscription: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {
    // Subscribe to user changes
    this.subscription = this.authService.currentUser$.subscribe(() => {
      this.updateView();
    });
  }

  @Input()
  set can(permissionList: string[] | string) {
    this.permissions = Array.isArray(permissionList)
      ? permissionList
      : [permissionList];
    this.updateView(); // Update on input change
  }

  private updateView() {
    if (this.authService.hasAnyPermission(this.permissions)) {
      this.viewContainer.createEmbeddedView(this.templateRef); // Show content
    } else {
      this.viewContainer.clear(); // Hide content
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); // Clean up to prevent memory leaks
  }
}
