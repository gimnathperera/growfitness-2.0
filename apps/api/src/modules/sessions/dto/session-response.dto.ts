import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SessionCoachRefDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;
  @ApiProperty({ example: 'coach@example.com' })
  email: string;
  @ApiPropertyOptional({ description: 'Coach profile', example: { name: 'Jane' } })
  coachProfile?: { name: string };
}

class SessionLocationRefDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;
  @ApiProperty({ example: 'Main Gym' })
  name: string;
  @ApiProperty({ example: '123 Fitness St' })
  address: string;
  @ApiPropertyOptional({ example: { lat: 40.7, lng: -74 } })
  geo?: { lat: number; lng: number };
  @ApiProperty({ example: true })
  isActive: boolean;
  @ApiPropertyOptional({
    description: 'Link to map or place page',
    example: 'https://maps.google.com/...',
  })
  placeUrl?: string;
}

export class SessionResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;
  @ApiProperty({ example: 'Morning Training Session', description: 'Session title/name' })
  title: string;
  @ApiProperty({ enum: ['INDIVIDUAL', 'GROUP'] })
  type: string;
  @ApiProperty({ description: 'Coach user ID' })
  coachId: string;
  @ApiProperty({ description: 'Location ID' })
  locationId: string;
  @ApiPropertyOptional({ description: 'Populated when coachId is expanded' })
  coach?: SessionCoachRefDto;
  @ApiPropertyOptional({ description: 'Populated when locationId is expanded' })
  location?: SessionLocationRefDto;
  @ApiProperty({ example: '2024-12-15T10:00:00.000Z' })
  dateTime: Date;
  @ApiProperty({ example: 60, description: 'Duration in minutes' })
  duration: number;
  @ApiProperty({ example: 1 })
  capacity: number;
  @ApiPropertyOptional({ type: [String], description: 'Kid IDs' })
  kids?: string[];
  @ApiProperty({ enum: ['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] })
  status: string;
  @ApiProperty({ example: false })
  isFreeSession: boolean;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}

export class PaginatedSessionResponseDto {
  @ApiProperty({ type: [SessionResponseDto], description: 'List of sessions' })
  data: SessionResponseDto[];
  @ApiProperty({ example: 42, description: 'Total count' })
  total: number;
  @ApiProperty({ example: 1, description: 'Current page' })
  page: number;
  @ApiProperty({ example: 10, description: 'Items per page' })
  limit: number;
  @ApiProperty({ example: 5, description: 'Total pages' })
  totalPages: number;
}
