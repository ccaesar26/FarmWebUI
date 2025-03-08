import { Component, OnInit } from '@angular/core';
import { SpeedDial } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { UserService } from '../../../core/services/user.service';
import { CommonModule } from '@angular/common';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

interface UserEntry {
  id: string;
  username: string;
  email: string;
  userProfileId: string;
  name: string;
  attributeNames: string[];
}

@Component({
  selector: 'app-people-management',
  imports: [
    SpeedDial,
    CommonModule
  ],
  templateUrl: './people-management.component.html',
  styleUrl: './people-management.component.css'
})
export class PeopleManagementComponent implements OnInit {
  items: MenuItem[] | null = null;
  workers: UserEntry[] = [];

  constructor(
    protected router: Router,
    private userService: UserService,
    private userProfileService: UserProfileService
  ) {
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Add',
        icon: 'pi pi-plus',
        command: () => {
          this.router.navigate([ '/dashboard/people/add' ]);
        }
      },
      {
        label: 'Download CSV',
        icon: 'pi pi-download',
        command: () => {
        }
      },
    ]

    this.fetchWorkers();
  }

  fetchWorkers(): void {
    this.userService.getWorkerUsers()
      .pipe(
        switchMap(users => {
          if (users.length === 0) {
            alert('No workers found');
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
                    userProfileId: user.userProfileId,  // Correct ID from profile
                    name: profile.name, // Combine to form a full name
                    attributeNames: profile.attributeNames || [] // Default to empty array if null
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
}
