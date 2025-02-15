import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-success',
  imports: [
    Button
  ],
  templateUrl: './register-success.component.html',
  styleUrl: './register-success.component.css'
})
export class RegisterSuccessComponent {
  constructor(private router: Router) {
  }

  navigateToLogin() {
    this.router.navigate([ 'login' ]);
  }
}
