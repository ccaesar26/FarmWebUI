import { Component, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { Drawer } from 'primeng/drawer';
import { Avatar } from 'primeng/avatar';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  imports: [
    Ripple,
    Drawer,
    Button,
    Avatar
  ],
  styleUrls: [ './side-menu.component.scss' ]
})
export class SideMenuComponent {
  visible: boolean = false;

  constructor(protected authService: AuthService, protected router: Router) {
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
