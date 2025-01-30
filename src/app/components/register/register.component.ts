import { Component } from '@angular/core';
import {Fluid} from 'primeng/fluid';
import {InputGroup} from 'primeng/inputgroup';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {FloatLabel} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {PasswordDirective} from 'primeng/password';
import {Button} from 'primeng/button';
import {RouterLink} from '@angular/router';

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
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerUsername = new FormControl('');
  registerPassword = new FormControl('');
  registerEmail = new FormControl('');
  registerConfirmPassword = new FormControl('');
  isRegistering: boolean = false;
}
