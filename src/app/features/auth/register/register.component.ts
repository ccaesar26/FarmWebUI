import { Component } from '@angular/core';
import { Fluid } from 'primeng/fluid';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordDirective } from 'primeng/password';
import { Button } from 'primeng/button';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [
    Fluid,
    InputGroup,
    InputGroupAddon,
    FloatLabel,
    InputText,
    ReactiveFormsModule,
    PasswordDirective,
    Button,
    NgIf
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm = new FormGroup({
    username: new FormControl('', [ Validators.required, Validators.minLength(3) ]),
    email: new FormControl('', [ Validators.required, Validators.email ]),
    password: new FormControl('', [ Validators.required, Validators.minLength(8) ]),
    confirmPassword: new FormControl('', [ Validators.required, Validators.minLength(8) ])
  });

  isRegistering: boolean = false;
  showPassword: boolean = false;
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.registerForm.invalid) return;

    const { username, email, password, confirmPassword } = this.registerForm.value;

    if (username == null || email == null || password == null || confirmPassword == null) {
      this.errorMessage = 'All fields are required';
      return;
    }

    if (password !== confirmPassword) {
      this.errorMessage = "Passwords do not match";
      return;
    }

    this.isRegistering = true;
    this.errorMessage = null;

    const role = 'Manager';

    this.authService.register({ username, email, password, role }).pipe(
      finalize(() => this.isRegistering = false)
    ).subscribe({
      next: () => this.router.navigate(['/register/success']),
      error: (error) => {
        this.errorMessage = error.message;
        alert(error.message);
      }
    });
  }
}
