import { Component, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SideMenuComponent } from '../../components/side-menu/side-menu.component';
import { Button, ButtonDirective, ButtonIcon } from 'primeng/button';
import { NgClass, NgIf } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { Badge } from 'primeng/badge';
import { OverlayBadge } from 'primeng/overlaybadge';
import { Drawer } from 'primeng/drawer';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    SideMenuComponent,
    Button,
    NgClass,
    Ripple,
    Badge,
    NgIf,
    ButtonDirective,
    OverlayBadge,
    ButtonIcon,
    Drawer
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  expanded: WritableSignal<boolean> = signal(false);
  notificationCount: WritableSignal<number> = signal(0);
  notificationVisible = signal<boolean>(false);
}
