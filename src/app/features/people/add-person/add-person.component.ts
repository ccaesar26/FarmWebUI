import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Button, ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { PasswordDirective } from 'primeng/password';
import { Calendar } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { Tooltip } from 'primeng/tooltip';
import { Message } from 'primeng/message';
import { Fluid } from 'primeng/fluid';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { FloatLabel } from 'primeng/floatlabel';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { Router } from '@angular/router';
import {
  AttributesRequest,
  AttributeMap,
  CreateUserProfileRequest
} from '../../../core/models/user-profile.model';
import { RegisterRequest } from '../../../core/models/auth.model';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { UserService } from '../../../core/services/user.service';

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
  selector: 'app-add-person',
  imports: [
    ReactiveFormsModule,
    Card,
    InputText,
    Tooltip,
    DropdownModule,
    Calendar,
    Message,
    ButtonDirective,
    NgIf,
    Fluid,
    InputGroup,
    InputGroupAddon,
    FloatLabel,
    PasswordDirective,
    Button,
    Select,
    MultiSelect,
  ],
  templateUrl: './add-person.component.html',
  styleUrl: './add-person.component.css'
})
export class AddPersonComponent implements OnInit {
  personForm = new FormGroup({
    username: new FormControl('', [ Validators.required ]),
    email: new FormControl('', [ Validators.required ]),
    password: new FormControl('', [ Validators.required ]),
    name: new FormControl('', [ Validators.required ]),
    dateOfBirth: new FormControl('', [ Validators.required ]),
    gender: new FormControl<string | null>(null, [ Validators.required ]),
    attributes: new FormControl<string[]>([], [ Validators.required ]),
  });
  genders: { label: string; value: string }[] = [];
  submitted: boolean = false;
  submitting: boolean = false;
  showPassword: boolean = false;
  title: string = 'Add Person';

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
  }

  onSubmit() {
    this.submitting = true;
    this.submitted = true;

    if (this.personForm.valid) {
      const { username, email, password, name, dateOfBirth, gender, attributes } = this.personForm.value;

      if (username == null || email == null || password == null || name == null || dateOfBirth == null || gender == null || attributes == null) {
        console.log("Error: One or more fields are null");
        return;
      }

      const registerRequest: RegisterRequest = {
        username: username,
        email: email,
        password: password,
        role: "Worker"
      };

      const userProfile: CreateUserProfileRequest = {
        userId: null,
        name: name,
        dateOfBirth: this.formatDate(dateOfBirth),
        gender: gender,
        role: "Worker"
      };

      const assignAttributesRequest: AttributesRequest = {
        userProfileId: null,
        attributeNames: attributes
      };

      this.addPersonToFarm(registerRequest, userProfile, assignAttributesRequest);
    } else { //form not valid
      console.log("Form is invalid");
      return;
    }
  }

  addPersonToFarm(
    registerRequest: RegisterRequest,
    userProfile: CreateUserProfileRequest,
    attributes: AttributesRequest
  ) {
    this.userService.createUser(registerRequest).subscribe({
      next: (response) => {
        userProfile.userId = response.userId;
        this.userProfileService.createUserProfile(userProfile).subscribe({
          next: (response) => {
            attributes.userProfileId = response.userProfileId;
            this.userProfileService.assignAttributes(attributes).subscribe({
              next: () => {
                this.router
                  .navigate([ '/dashboard/people' ], { replaceUrl: true })
                  .then(() => this.submitting = false);
              },
              error: (error) => {
                console.error('Failed to assign attributes', error);
                this.submitting = false;
              }
            });
          },
          error: (error) => {
            console.error('Failed to create user profile', error);
            this.submitting = false;
          }
        });
      },
      error: (error) => {
        console.error('Failed to create user', error);
        this.submitting = false;
      }
    });
  }

  onCancel() {
    this.router.navigate([ '/dashboard/people' ], { replaceUrl: true }).then(
      () => this.submitting = false
    )
  }

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
}
