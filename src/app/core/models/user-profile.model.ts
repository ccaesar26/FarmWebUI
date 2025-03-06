export interface CreateUserProfileRequest {
  name: string;
  dateOfBirth: string;
  gender: string;
  role: string;
}

export interface UserProfile {
  name: string;
  dateOfBirth: string;
  gender: string;
}
