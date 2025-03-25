export interface CreateUserProfileRequest {
  userId: string | null;
  name: string;
  dateOfBirth: string;
  gender: string;
  role: string;
}

export interface CreateUserProfileResponse {
  userProfileId: string;
}

export interface UserProfileDto {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  attributeNames: string[];
}

export interface AttributesRequest {
  userProfileId: string | null;
  attributeNames: string[];
}

export interface AttributeMap {
  [category: string]: string[];
}

export interface UpdateUserProfileRequest {
  name: string;
  dateOfBirth: string;
  gender: string;
}
