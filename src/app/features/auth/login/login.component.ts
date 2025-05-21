import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { PasswordDirective } from 'primeng/password';
import { FloatLabel } from 'primeng/floatlabel';
import { Fluid } from 'primeng/fluid';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

import { finalize } from 'rxjs';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-login',
  imports: [
    InputText,
    FormsModule,
    Button,
    FloatLabel,
    Fluid,
    ReactiveFormsModule,
    InputIconModule,
    InputGroup,
    InputGroupAddon,
    PasswordDirective
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl('', [ Validators.required, Validators.email ]),
    password: new FormControl('', [ Validators.required, Validators.minLength(8) ])
  });

  showPassword: boolean = false;
  errorMessage: string | null = null;
  isSubmitting: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value;

    if (email == null || password == null) {
      this.errorMessage = 'Email and password are required';
      this.isSubmitting = false;
      return;
    }

    this.authService.login({ email, password }).subscribe({
      next: () => this.router
        .navigate([ '/dashboard' ])
        .then(() => this.isSubmitting = false),
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.message;
      }
    });
  }
}
