/**
 * Response DTO for Kid entity
 * Transforms parentId (ObjectId) to parent (populated object)
 */
export class KidResponseDto {
  id: string;
  parent?: {
    id: string;
    email: string;
    parentProfile?: {
      name: string;
      location?: string;
    };
    coachProfile?: {
      name: string;
    };
  };
  name: string;
  gender: string;
  birthDate: Date;
  goal?: string;
  currentlyInSports: boolean;
  medicalConditions: string[];
  sessionType: string;
  achievements?: string[];
  milestones?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
