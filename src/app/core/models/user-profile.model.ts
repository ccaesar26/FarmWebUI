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

export interface AttributeCategory {
  label: string;
  value: string;
  items: AttributeItem[];
}

export interface AttributeItem {
  label: string;
  value: string;
}

export interface UpdateUserProfileRequest {
  name: string;
  dateOfBirth: string;
  gender: string;
}

export function convertAttributeMap(attributeMap: AttributeMap): AttributeCategory[] {
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
