import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { Card } from 'primeng/card';
import { UserService } from '../../../core/services/user.service';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { UserProfileDto } from '../../../core/models/user-profile.model';
import { UserDto } from '../../../core/models/user.model';
import { Message } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Chip } from 'primeng/chip';
import { Divider } from 'primeng/divider';
import { DatePipe } from '@angular/common';
import { Avatar } from 'primeng/avatar';
import { PrimeTemplate } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-profile',
  imports: [
    Card,
    Message,
    ProgressSpinner,
    Chip,
    Divider,
    DatePipe,
    Avatar,
    PrimeTemplate,
    ButtonDirective,
    Ripple
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  user: WritableSignal<UserDto | null> = signal(null);
  profile: WritableSignal<UserProfileDto | null> = signal(null);
  userInitials: WritableSignal<string | undefined> = signal(undefined);

  isLoading: WritableSignal<boolean> = signal(true);
  isError = signal<boolean>(false);

  constructor(
    private userService: UserService,
    private profileService: UserProfileService,
    ) {
  }

  ngOnInit() {
    this.isLoading.set(true);
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user.set(user);

        this.profileService.getManagerProfile().subscribe({
          next: (profile) => {
            this.profile.set(profile);
            this.userInitials.set(profile.name.charAt(0).toUpperCase());
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('Error fetching user profile:', error);
            this.isError.set(true);
            this.isLoading.set(false);
          }
        })
      },
      error: (error) => {
        console.error('Error fetching user:', error);
        this.isError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  editProfile() {

  }

  changePassword() {

  }
}
