import { Component, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { Drawer } from 'primeng/drawer';
import { Avatar } from 'primeng/avatar';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserProfileService } from '../../services/user-profile.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  imports: [
    Ripple,
    Drawer,
    Button,
    Avatar,
    RouterLink,
    RouterLinkActive
  ],
  styleUrls: [ './side-menu.component.scss' ]
})
export class SideMenuComponent {
  visible: boolean = false;
  initial: string | undefined;
  name: string | undefined;

  constructor(
    protected router: Router,
    protected authService: AuthService,
    private userProfileService: UserProfileService
  ) {
    this.userProfileService.getManagerProfile().subscribe((userProfile) => {
      this.name = userProfile?.name;
      this.initial = userProfile?.name?.charAt(0);
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate([ '/login' ]);
  }
}
