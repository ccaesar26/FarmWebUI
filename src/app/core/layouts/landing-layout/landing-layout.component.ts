import { Component } from '@angular/core';
import { Card } from "primeng/card";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-tabs-layout',
  imports: [
    Card,
    RouterOutlet
  ],
  templateUrl: './landing-layout.component.html',
  styleUrl: './landing-layout.component.css'
})
export class LandingLayoutComponent {

}
