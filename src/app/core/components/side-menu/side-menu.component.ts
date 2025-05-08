// side-menu.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Ripple } from 'primeng/ripple';
import { Avatar } from 'primeng/avatar';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserProfileService } from '../../services/user-profile.service';
import { StyleClass } from 'primeng/styleclass';
import { SidebarModule } from 'primeng/sidebar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [
    CommonModule, Ripple, Avatar, RouterLink,
    RouterLinkActive, StyleClass, SidebarModule
  ],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnChanges { // Implement OnChanges

  // Internal state for visibility
  protected _isExpanded: boolean = false;

  // Input to receive the initial/trigger state from parent
  @Input() set expanded(value: boolean) {
    // This setter allows the parent to *trigger* the opening
    // We only react to the parent setting it to TRUE
    if (value) {
      this._isExpanded = true;
    }
    // We don't directly set to false here; closing is handled internally
    // or via the (visibleChange) event from p-sidebar
  }
  get expanded(): boolean {
    return this._isExpanded;
  }


  // Output to notify parent ONLY when sidebar closes internally
  @Output() collapsed = new EventEmitter<void>(); // Renamed for clarity

  initial: string | undefined;
  name: string | undefined;

  constructor(
    protected router: Router,
    protected authService: AuthService,
    private userProfileService: UserProfileService
  ) {
    this.userProfileService.getManagerProfile().subscribe((userProfile) => {
      this.name = userProfile?.name;
      this.initial = userProfile?.name?.charAt(0).toUpperCase();
    });
  }

  // Use OnChanges to detect external changes if needed, though the setter handles opening
  ngOnChanges(changes: SimpleChanges) {
    if (changes['expanded']) {
      // Optional: Add logic here if you need to react specifically
      // when the parent *forces* a change (e.g., resets the state).
      // The setter above handles the primary 'open' trigger.
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeSidebar(); // Close sidebar on logout
  }

  // Internal method to close the sidebar
  closeSidebar() {
    if (this._isExpanded) { // Only emit if it was actually open
      this._isExpanded = false;
      this.collapsed.emit(); // Notify parent it has collapsed
    }
  }

  // Method called by p-sidebar's (visibleChange) event
  onSidebarHide() {
    // This is triggered when p-sidebar closes itself (e.g., close icon, escape key)
    if (this._isExpanded) {
      this._isExpanded = false;
      this.collapsed.emit(); // Notify parent
    }
  }

  // Method called by the hamburger button *within* this component
  toggleSidebarInternal() {
    this._isExpanded = !this._isExpanded;
    if (!this._isExpanded) {
      this.collapsed.emit(); // Notify if closed
    }
  }
}
