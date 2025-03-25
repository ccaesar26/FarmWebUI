import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { PersonFormComponent } from '../person-form/person-form.component';
import { RegisterRequest } from '../../../core/models/auth.model';
import {
  AttributesRequest,
  CreateUserProfileRequest,
  UpdateUserProfileRequest
} from '../../../core/models/user-profile.model';
import { UpdateUserRequest } from '../../../core/models/user.model';

export interface UserEntry {
  id: string;
  username: string;
  email: string;
  password?: string;
  userProfileId: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  attributes: string[];
}

@Component({
  selector: 'app-people-management',
  imports: [
    CommonModule,
    Toolbar,
    Button,
    TableModule,
    IconField,
    InputIcon,
    InputText,
    Dialog,
    PersonFormComponent
  ],
  templateUrl: './people-management.component.html',
  styleUrl: './people-management.component.css'
})
export class PeopleManagementComponent implements OnInit {
  items: MenuItem[] | null = null;
  workers: UserEntry[] = [];
  selectedWorker: UserEntry | null = null;
  selectedWorkers: UserEntry[] = [];
  displayModal: boolean = false;

  constructor(
    protected router: Router,
    private userService: UserService,
    private userProfileService: UserProfileService
  ) {
  }

  ngOnInit() {
    this.fetchWorkers();
  }

  fetchWorkers(): void {
    this.userService.getWorkerUsers()
      .pipe(
        switchMap(users => {
          if (users.length === 0) {
            return of([]); // Return an empty array if no users
          }
          // Create an array of observables for fetching each user's profile
          const profileObservables = users.map(user => {
              return this.userProfileService.getProfileByUserId(user.id).pipe(
                catchError(error => {
                  // Handle errors for individual profile fetches. Log, and return a default.
                  console.error(`Error fetching profile for user ${ user.id }:`, error);
                  return of(null); // Return null for the failed profile
                })
              );
            }
          );

          // Use forkJoin to wait for all profile requests to complete
          return forkJoin(profileObservables).pipe(
            map(profiles => {
              // Combine user data with profile data, filtering out failed profiles
              const combinedData: UserEntry[] = [];
              for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const profile = profiles[i];

                if (profile) { // Only add if profile was fetched successfully
                  const userEntry: UserEntry = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    password: undefined,
                    userProfileId: user.userProfileId,  // Correct ID from profile
                    name: profile.name, // Combine to form a full name
                    dateOfBirth: profile.dateOfBirth,
                    gender: profile.gender,
                    attributes: profile.attributeNames || [] // Default to empty array if null
                  };
                  combinedData.push(userEntry);
                }
              }
              return combinedData;
            })
          );
        }),
        catchError(error => {  //main error handler
          console.error('Error fetching worker users:', error);
          return of([]); // Return an empty array to prevent the application from breaking
        })
      )
      .subscribe(workers => {
        this.workers = workers;
      });
  }

  openNew() {
    this.selectedWorker = null; // Set to null for add mode
    this.displayModal = true;
  }

  deleteSelectedPeople() {

  }

  openEditWorker(worker: UserEntry) {
    this.selectedWorker = worker; // Pass the selected user
    this.displayModal = true;
  }

  deleteWorker(worker: UserEntry) {

  }

  onSave(updatedUser: UserEntry) {
    if (this.selectedWorker) {
      const updateUserRequest: UpdateUserRequest = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        roleName: 'Worker'
      }

      const updateUserProfileRequest: UpdateUserProfileRequest = {
        name: updatedUser.name,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender
      }

      const assignAttributesRequest: AttributesRequest = {
        userProfileId: updatedUser.userProfileId,
        attributeNames: updatedUser.attributes
      }

      this.updatePersonInFarm(updateUserRequest, updateUserProfileRequest, assignAttributesRequest);
    } else {
      if (updatedUser.password == null) {
        console.log('Error: Password is null');
        return;
      }
      // Add the new user
      const registerRequest: RegisterRequest = {
        username: updatedUser.username,
        email: updatedUser.email,
        password: updatedUser.password,
        role: 'Worker'
      }

      const userProfile: CreateUserProfileRequest = {
        userId: null,
        name: updatedUser.name,
        dateOfBirth: updatedUser.dateOfBirth,
        gender: updatedUser.gender,
        role: 'Worker'
      }

      const assignAttributesRequest: AttributesRequest = {
        userProfileId: null,
        attributeNames: updatedUser.attributes
      }

      this.addPersonToFarm(registerRequest, userProfile, assignAttributesRequest);
    }
  }

  private addPersonToFarm(
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
                  // .then(() => this.submitting = false);
              },
              error: (error) => {
                console.error('Failed to assign attributes', error);
                // this.submitting = false;
              }
            });
          },
          error: (error) => {
            console.error('Failed to create user profile', error);
            // this.submitting = false;
          }
        });
      },
      error: (error) => {
        console.error('Failed to create user', error);
        // this.submitting = false;
      }
    });
  }

  private updatePersonInFarm(
    updateUserRequest: UpdateUserRequest,
    updateUserProfileRequest: UpdateUserProfileRequest,
    assignAttributesRequest: AttributesRequest
  ) {
    this.userService.updateUser(updateUserRequest).subscribe({
      next: () => {
        this.userProfileService.updateUserProfile(updateUserRequest.id, updateUserProfileRequest).subscribe({
          next: () => {
            assignAttributesRequest.userProfileId = updateUserRequest.id;
            this.userProfileService.updateAttributes(assignAttributesRequest).subscribe({
              next: () => {
                this.router
                  .navigate([ '/dashboard/people' ], { replaceUrl: true })
                  // .then(() => this.submitting = false);
              },
              error: (error) => {
                console.error('Failed to assign attributes', error);
                // this.submitting = false;
              }
            });
          },
          error: (error) => {
            console.error('Failed to update user profile', error);
            // this.submitting = false;
          }
        });
      },
      error: (error) => {
        console.error('Failed to update user', error);
        // this.submitting = false;
      }
    });
  }
}
