export interface User {
  id: string;
  username: string;
  email: string;
  userProfileId: string;
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  roleName: string;
}

export interface UpdateUserRequest {
  id: string;
  username: string;
  email: string;
  roleName: string;
}

export interface UpdateUserResponse {
  userId: string;
  username: string;
  email: string;
  roleName: string;
  userProfileId: string;
}
