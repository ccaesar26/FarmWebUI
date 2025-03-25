import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import {
  AttributesRequest,
  AttributeMap,
  CreateUserProfileRequest
} from '../../../core/models/user-profile.model';
import { RegisterRequest } from '../../../core/models/auth.model';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { UserService } from '../../../core/services/user.service';
import { Dialog } from 'primeng/dialog';
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

interface AttributeItem {
  label: string;
  value: string;
}

interface AttributeCategory {
  label: string;
  value: string;
  items: AttributeItem[];
}

@Component({
  selector: 'app-person-form',
  imports: [
    ReactiveFormsModule,
    DropdownModule,
    Dialog,
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
        this.availableAttributes = this.convertAttributeMap(attributeMap);
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

    if (username == null || email == null || password == null || name == null || dateOfBirth == null || gender == null || attributes == null) {
      console.log("Error: One or more fields are null");
      return;
    }

    const formData = this.personForm.value;
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
      password: password
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

  // onSubmit() {
  //   this.submitting = true;
  //   this.submitted = true;
  //
  //   if (this.personForm.valid) {
  //     const { username, email, password, fullName, dateOfBirth, gender, attributes } = this.personForm.value;
  //
  //     if (username == null || email == null || password == null || fullName == null || dateOfBirth == null || gender == null || attributes == null) {
  //       console.log("Error: One or more fields are null");
  //       return;
  //     }
  //
  //     const registerRequest: RegisterRequest = {
  //       username: username,
  //       email: email,
  //       password: password,
  //       role: "Worker"
  //     };
  //
  //     const userProfile: CreateUserProfileRequest = {
  //       userId: null,
  //       name: fullName,
  //       dateOfBirth: this.formatDate(dateOfBirth),
  //       gender: gender,
  //       role: "Worker"
  //     };
  //
  //     const assignAttributesRequest: AssignAttributesRequest = {
  //       userProfileId: null,
  //       attributeNames: attributes
  //     };
  //
  //     this.addPersonToFarm(registerRequest, userProfile, assignAttributesRequest);
  //   } else { //form not valid
  //     console.log("Form is invalid");
  //     return;
  //   }
  // }

  // onCancel() {
  //   this.router.navigate([ '/dashboard/people' ], { replaceUrl: true }).then(
  //     () => this.submitting = false
  //   )
  // }

  private formatDate(date: Date | string): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  private convertAttributeMap(attributeMap: AttributeMap): AttributeCategory[] {
    const categories: AttributeCategory[] = [];

    for (const categoryName in attributeMap) {
      if (Object.prototype.hasOwnProperty.call(attributeMap, categoryName)) {
        const attributes = attributeMap[categoryName];

        const items: AttributeItem[] = attributes.map(attributeName => ({
          label: attributeName,
          value: attributeName,
        }));

        const category: AttributeCategory = {
          label: categoryName,
          value: categoryName,
          items: items,
        };

        categories.push(category);
      }
    }

    return categories;
  }

  onCancel() {
    this.cancel.emit();
  }

  isAddMode(): boolean {
    return !this.person;
  }
}
