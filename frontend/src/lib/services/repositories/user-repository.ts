/**
 * User Repository
 * Handles all user-related API calls
 * Follows: Single Responsibility Principle (SRP)
 * Follows: Repository Pattern
 */

import { ApiRequestHelper } from '../api-request-helper';

export interface UserProfile {
  user_id: string;
  clerk_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: 'doctor' | 'patient' | 'admin';
  status: string;
  phone_number: string | null;
  // Doctor-specific
  specialty: string | null;
  license_number: string | null;
  years_of_experience: number | null;
  qualifications: string[];
  clinic_address: string | null;
  // Patient-specific
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  blood_type: string | null;
  allergies: string[];
  chronic_conditions: string[];
  emergency_contact: string | null;
  created_at: string | null;
}

/**
 * IUserRepository defines the contract for user data operations
 * Follows: Interface Segregation Principle (ISP)
 */
export interface IUserRepository {
  getCurrentUser(): Promise<UserProfile>;
  updateMyProfile(payload: Partial<UserProfile>): Promise<{ message: string; user_id: string; user: Record<string, unknown> }>;
  getUserById(id: string): Promise<UserProfile>;
  getAllUsers(): Promise<UserProfile[]>;
  deleteUser(id: string): Promise<void>;
  updateUserStatus(id: string, status: string): Promise<UserProfile>;
}

export class UserRepository implements IUserRepository {
  constructor(private apiHelper: ApiRequestHelper) {}

  async getCurrentUser(): Promise<UserProfile> {
    return this.apiHelper.get<UserProfile>('/users/me');
  }

  async updateMyProfile(payload: Partial<UserProfile>): Promise<{ message: string; user_id: string; user: Record<string, unknown> }> {
    return this.apiHelper.patch<{ message: string; user_id: string; user: Record<string, unknown> }>('/users/me', payload);
  }

  async getUserById(id: string): Promise<UserProfile> {
    return this.apiHelper.get<UserProfile>(`/users/${id}`);
  }

  async getAllUsers(): Promise<UserProfile[]> {
    return this.apiHelper.get<UserProfile[]>('/users');
  }

  async deleteUser(id: string): Promise<void> {
    await this.apiHelper.delete(`/users/${id}`);
  }

  async updateUserStatus(id: string, status: string): Promise<UserProfile> {
    return this.apiHelper.patch<UserProfile>(`/users/${id}/status`, { status });
  }
}

let userRepositoryInstance: IUserRepository | null = null;

export function getUserRepository(apiHelper?: ApiRequestHelper): IUserRepository {
  if (!userRepositoryInstance) {
    const { getApiRequestHelper } = require('../api-request-helper');
    userRepositoryInstance = new UserRepository(apiHelper || getApiRequestHelper());
  }
  return userRepositoryInstance;
}

export function setUserRepository(repo: IUserRepository): void {
  userRepositoryInstance = repo;
}
