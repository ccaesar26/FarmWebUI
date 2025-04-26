import { Component, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { FilterService, MenuItem, SelectItem } from 'primeng/api';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { catchError, forkJoin, map, of, Subscription, switchMap } from 'rxjs';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { ColumnFilter, Table, TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { PersonFormComponent } from '../person-form/person-form.component';
import { RegisterRequest } from '../../../core/models/auth.model';
import {
  AttributeCategory,
  AttributesRequest, convertAttributeMap,
  CreateUserProfileRequest,
  UpdateUserProfileRequest
} from '../../../core/models/user-profile.model';
import { UpdateUserRequest } from '../../../core/models/user.model';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { MultiSelect } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { SelectButton } from 'primeng/selectbutton';

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

type AttributeMatchMode = 'containsAnyAttribute' | 'containsAllAttributes';

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
    PersonFormComponent,
    Card,
    Tag,
    MultiSelect,
    FormsModule,
    SelectButton
  ],
  templateUrl: './people-management.component.html',
  styleUrl: './people-management.component.scss'
})
export class PeopleManagementComponent implements OnInit {
  items: MenuItem[] | null = null;
  workers: WritableSignal<UserEntry[]> = signal([]);
  selectedWorker: WritableSignal<UserEntry | null> = signal(null);
  selectedWorkers: UserEntry[] = [];
  displayModal: boolean = false;
  submitting: WritableSignal<boolean> = signal(false);
  availableAttributes: WritableSignal<AttributeCategory[]> = signal([]);

  @ViewChild('dt') table!: Table;
  @ViewChild('attributeFilter') attributeColumnFilter!: ColumnFilter;

  // --- New Properties for Attribute Filter Mode ---
  attributeMatchMode: AttributeMatchMode = 'containsAnyAttribute'; // Default mode
  attributeFilterModeOptions: SelectItem[] = [
    { label: 'Contains Any', value: 'containsAnyAttribute' },
    { label: 'Contains All', value: 'containsAllAttributes' }
  ];
  // Store the current filter value from the multiselect to re-apply filter on mode change
  currentAttributeFilterValue: string[] | null = null;
  // --- End New Properties ---

  constructor(
    private userService: UserService,
    private userProfileService: UserProfileService,
    private filterService: FilterService
  ) {
  }

  ngOnInit() {
    this.fetchWorkers();

    this.userProfileService.getAvailableAttributes().subscribe({
      next: (attributeMap) => {
        this.availableAttributes.set(convertAttributeMap(attributeMap));
      },
      error: (error) => {
        console.error('Failed to get attribute map', error);
      }
    });

    this.registerCustomFilters();
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
                  console.error(`Error fetching profile for user ${user.id}:`, error);
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
        this.workers.set(workers);
      });
  }

  // --- Define the Custom Filter Constraint Function ---
  filterAttributes(value: string[] | null, filter: string[] | null): boolean {
    if (filter === null || filter === undefined || filter.length === 0) {
      return true; // No filter applied
    }
    if (value === null || value === undefined || value.length === 0) {
      return false; // Row has no attributes
    }

    // Check the selected match mode and apply the corresponding logic
    if (this.attributeMatchMode === 'containsAllAttributes') {
      // Check if ALL filter attributes are present in the row's attributes
      return filter.every(filterAttribute => value.includes(filterAttribute));
    } else { // Default to 'containsAnyAttribute'
      // Check if ANY of the row's attributes are present in the filter
      return filter.some(filterAttribute => value.includes(filterAttribute));
    }
  }
  // --- End Custom Filter Constraint Function ---

  registerCustomFilters() {
    // Register the custom filter constraint with a unique name
    // Pass 'this' context so the function can access 'this.attributeMatchMode'
    this.filterService.register('customAttributeFilter', this.filterAttributes.bind(this));
    console.log('Custom filter "customAttributeFilter" registered.');
  }

  onAttributeFilterModeChange() {
    console.log("Mode changed to:", this.attributeMatchMode);

    // Introduce a small delay before triggering the filter
    setTimeout(() => {
      // Get the filter metadata safely (needed again inside the timeout)
      const filterMetadata = this.table.filters['attributes'];
      let currentFilterValue: any = null;

      if (filterMetadata && Array.isArray(filterMetadata) && filterMetadata.length > 0) {
        currentFilterValue = filterMetadata[0]?.value;
      }

      // Manually trigger the filter for the 'attributes' column
      // Ensure table is still available (good practice within async operations)
      if (this.table) {
        this.table.filter(currentFilterValue, 'attributes', 'customAttributeFilter');
        console.log("Re-applying filter for 'attributes' column with value:", currentFilterValue);
      }
    }, 0); // A timeout of 0ms is usually enough to push execution after the current cycle
  }

  openNew() {
    this.selectedWorker.set(null); // Set to null for add mode
    this.displayModal = true;
  }

  deleteSelectedPeople() {
    if (this.selectedWorkers.length === 0) return;

    const deleteObservables = this.selectedWorkers.map(worker =>
      this.userService.deleteUser(worker.id).pipe(
        catchError(error => {
          console.error(`Failed to delete user ${worker.id}:`, error);
          return of(null); // Prevents breaking the process on failure
        })
      )
    );

    forkJoin(deleteObservables).subscribe(() => {
      console.log(`Deleted ${this.selectedWorkers.length} users successfully.`);
      this.selectedWorkers = [];
      this.fetchWorkers();
    });
  }


  openEditWorker(worker: UserEntry) {
    this.selectedWorker.set(worker); // Pass the selected user
    this.displayModal = true;
  }

  deleteWorker(worker: UserEntry) {
    if (!worker) return;

    this.userService.deleteUser(worker.id).subscribe({
      next: () => {
        console.log(`User ${worker.id} deleted successfully.`);
        this.fetchWorkers();
      },
      error: (error) => {
        console.error(`Failed to delete user ${worker.id}:`, error);
      }
    });
  }


  onSave(updatedUser: UserEntry) {
    if (this.selectedWorker()) {
      const updateUserRequest: UpdateUserRequest = {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        roleName: 'Worker'
      }

      const updateUserProfileRequest: UpdateUserProfileRequest = {
        name: updatedUser.name,
        dateOfBirth: this.formatDate(updatedUser.dateOfBirth),
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
        dateOfBirth: this.formatDate(updatedUser.dateOfBirth),
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
                this.displayModal = false;
                this.submitting.set(false);
                this.fetchWorkers();
              },
              error: (error) => {
                console.error('Failed to assign attributes', error);
                this.submitting.set(false);
              }
            });
          },
          error: (error) => {
            console.error('Failed to create user profile', error);
            this.submitting.set(false);
          }
        });
      },
      error: (error) => {
        console.error('Failed to create user', error);
        this.submitting.set(false);
      }
    });
  }

  private updatePersonInFarm(
    updateUserRequest: UpdateUserRequest,
    updateUserProfileRequest: UpdateUserProfileRequest,
    assignAttributesRequest: AttributesRequest
  ) {
    this.userService.updateUser(updateUserRequest).subscribe({
      next: (response) => {
        this.userProfileService.updateUserProfile(response.userProfileId, updateUserProfileRequest).subscribe({
          next: () => {
            assignAttributesRequest.userProfileId = response.userProfileId;
            this.userProfileService.updateAttributes(assignAttributesRequest).subscribe({
              next: () => {
                this.displayModal = false;
                this.submitting.set(false)
                this.fetchWorkers()
              },
              error: (error) => {
                console.error('Failed to assign attributes', error);
                this.submitting.set(false);
              }
            });
          },
          error: (error) => {
            console.error('Failed to update user profile', error);
            this.submitting.set(false);
          }
        });
      },
      error: (error) => {
        console.error('Failed to update user', error);
        this.submitting.set(false);
      }
    });
  }

  private formatDate(date: Date | string): string {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  }

  onCancel() {
    this.displayModal = false;
  }
}
