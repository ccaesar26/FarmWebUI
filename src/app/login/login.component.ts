import {Component} from '@angular/core';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

import {Checkbox} from 'primeng/checkbox';
import {InputText} from 'primeng/inputtext';
import {Button} from 'primeng/button';
import {FormsModule} from '@angular/forms';
import {PasswordDirective} from 'primeng/password';
import {FloatLabel} from 'primeng/floatlabel';
import {Fluid} from 'primeng/fluid';
import {InputIconModule} from 'primeng/inputicon';
import {InputGroup} from 'primeng/inputgroup';
import {InputGroupAddon} from 'primeng/inputgroupaddon';
import {Divider} from 'primeng/divider';

@Component({
  selector: 'app-login',
  imports: [
    Checkbox,
    InputText,
    FormsModule,
    Button,
    FloatLabel,
    Fluid,
    ReactiveFormsModule,
    InputIconModule,
    InputGroup,
    InputGroupAddon,
    PasswordDirective,
    Divider
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = new FormControl('');
  password = new FormControl('');
  rememberMe: boolean = false;

}
