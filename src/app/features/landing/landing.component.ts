import {Component} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import {RegisterComponent} from "../auth/register/register.component";
import {Tab, TabList, TabPanel, TabPanels, Tabs} from "primeng/tabs";
import {LoginComponent} from '../auth/login/login.component';

@Component({
  selector: 'app-landing',
  imports: [
    ReactiveFormsModule,
    RegisterComponent,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    LoginComponent
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {

}
