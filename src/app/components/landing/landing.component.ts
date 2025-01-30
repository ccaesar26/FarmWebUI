import {Component} from '@angular/core';
import {Card} from "primeng/card";
import {ReactiveFormsModule} from "@angular/forms";
import {RegisterComponent} from "../register/register.component";
import {Tab, TabList, TabPanel, TabPanels, Tabs} from "primeng/tabs";
import {LoginComponent} from '../login/login.component';

@Component({
  selector: 'app-landing',
  imports: [
    Card,
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
