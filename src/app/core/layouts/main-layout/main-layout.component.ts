import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';
import { Button, ButtonDirective } from 'primeng/button';
import { NgClass } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { Badge } from 'primeng/badge';
import { OverlayBadge } from 'primeng/overlaybadge';
import { Drawer } from 'primeng/drawer';
import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { AuthService } from '../../services/auth.service';
import { UserProfileService } from '../../services/user-profile.service';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    SideMenuComponent,
    Button,
    NgClass,
    Ripple,
    OverlayBadge,
    Drawer,
    Avatar,
    Menu,
    ButtonDirective
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  expanded: WritableSignal<boolean> = signal(false);
  notificationCount: WritableSignal<number> = signal(0);
  notificationVisible = signal<boolean>(false);

  userInitial: WritableSignal<string | undefined> = signal(undefined);
  userName: WritableSignal<string | undefined> = signal(undefined);

  profileMenuItems: WritableSignal<MenuItem[]> = signal([]);

  constructor(
    protected router: Router,
    protected authService: AuthService,
    private userProfileService: UserProfileService
  ) {
    this.userProfileService.getManagerProfile().subscribe((userProfile) => {
      this.userName.set(userProfile?.name);
      this.userInitial.set(userProfile?.name?.charAt(0).toUpperCase());
    });
  }

  ngOnInit(): void {
    this.profileMenuItems.set([
      {
        label: 'View Profile',
        icon: 'pi pi-fw pi-user',
        command: () => this.router.navigate(['/dashboard/profile'])
      },
      {
        separator: true
      },
      {
        label: 'Logout',
        icon: 'pi pi-fw pi-sign-out',
        command: () => this.logout()
      }
    ]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate([ '/login' ]);
  }
}
