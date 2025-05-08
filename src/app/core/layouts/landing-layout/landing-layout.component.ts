import { Component } from '@angular/core';
import { Card } from "primeng/card";
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-auth-tabs-layout',
  imports: [
    Card,
    RouterOutlet,
    Toast
  ],
  templateUrl: './landing-layout.component.html',
  styleUrl: './landing-layout.component.scss'
})
export class LandingLayoutComponent {

}
