import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import {
  AttributeCategory,
  AttributeItem,
  AttributeMap,
  convertAttributeMap
} from '../../../core/models/user-profile.model';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { UserService } from '../../../core/services/user.service';
import { UserEntry } from '../people-management/people-management.component';
import { Button, ButtonDirective } from 'primeng/button';
import { Calendar } from 'primeng/calendar';
import { Card } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { Fluid } from 'primeng/fluid';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { MultiSelect } from 'primeng/multiselect';
import { NgIf } from '@angular/common';
import { PasswordDirective } from 'primeng/password';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-person-form',
  imports: [
    ReactiveFormsModule,
    DropdownModule,
    Button,
    ButtonDirective,
    Calendar,
    Card,
    FloatLabel,
    Fluid,
    InputGroup,
    InputGroupAddon,
    InputText,
    Message,
    MultiSelect,
    NgIf,
    PasswordDirective,
    Select,
    Tooltip,
  ],
  templateUrl: './person-form.component.html',
  styleUrl: './person-form.component.css'
})
export class PersonFormComponent implements OnInit {

  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() person: UserEntry | null = null;
  @Output() save = new EventEmitter<UserEntry>();
  @Output() cancel = new EventEmitter<void>();

  personForm = new FormGroup({
    username: new FormControl('', [ Validators.required ]),
    email: new FormControl('', [ Validators.required ]),
    password: new FormControl(''),
    name: new FormControl('', [ Validators.required ]),
    dateOfBirth: new FormControl('', [ Validators.required ]),
    gender: new FormControl<string | null>(null, [ Validators.required ]),
    attributes: new FormControl<string[]>([], [ Validators.required ]),
  });

  genders: { label: string; value: string }[] = [];
  submitted: boolean = false;
  submitting: boolean = false;
  showPassword: boolean = false;

  availableAttributes: AttributeCategory[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private userProfileService: UserProfileService
  ) {
  }

  ngOnInit() {
    this.genders = [
      { label: 'Male', value: 'Male' },
      { label: 'Female', value: 'Female' }
    ];

    this.userProfileService.getAvailableAttributes().subscribe({
      next: (attributeMap) => {
        this.availableAttributes = convertAttributeMap(attributeMap);
      },
      error: (error) => {
        console.error('Failed to get attribute map', error);
      }
    });

    // Update form when the person input changes
    if (this.person) { //if a person has been passed, it is an edition
      this.personForm.patchValue(this.person);
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.personForm.invalid) {
      return;
    }

    const { username, email, password, name, dateOfBirth, gender, attributes } = this.personForm.value;

    if (username == null || email == null || name == null || dateOfBirth == null || gender == null || attributes == null) {
      console.log("Error: One or more fields are null");
      return;
    }

    // Create a CombinedUser object from the form data.
    const combinedUser: UserEntry = {
      id: this.person ? this.person.id : '', // Use existing ID if editing
      username: username,
      email: email,
      userProfileId: this.person ? this.person.userProfileId : '', // Use existing ID if editing
      name: name,
      dateOfBirth: dateOfBirth, // You might need to format this
      gender: gender,
      attributes: attributes,
      password: password || undefined, // Only include password if it is set
    };
    if (!this.person) { //if it is an add operation, password is required
      this.personForm.get('password')?.setValidators([ Validators.required, Validators.minLength(8) ]);
      this.personForm.get('password')?.updateValueAndValidity(); //re-check validity
    }

    if (this.personForm.invalid) { //if form still invalid
      return;
    }
    this.save.emit(combinedUser); //emit event
  }

  private formatDate(date: Date | string): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  onCancel() {
    this.cancel.emit();
  }

  isAddMode(): boolean {
    return !this.person;
  }
}
