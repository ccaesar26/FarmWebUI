export interface User {
  id: string;
  username: string;
  email: string;
  userProfileId: string;
}

export interface UpdateUserRequest {
  id: string;
  username: string;
  email: string;
  roleName: string;
}
