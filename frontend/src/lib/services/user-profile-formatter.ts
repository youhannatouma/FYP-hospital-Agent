/**
 * User Profile Utilities
 * Separates data transformation logic from hooks
 * Follows: Single Responsibility Principle (SRP)
 */

import { UserProfile } from './repositories/user-repository';

export class UserProfileFormatter {
  static getFullName(profile: UserProfile | null): string {
    if (!profile) return '';
    const firstName = profile.first_name || '';
    const lastName = profile.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown User';
  }

  static getInitials(profile: UserProfile | null): string {
    if (!profile) return '?';
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase() || '?';
  }

  static getDisplayRole(profile: UserProfile | null): string {
    if (!profile) return 'User';
    const roleMap: Record<string, string> = {
      doctor: 'Healthcare Provider',
      patient: 'Patient',
      admin: 'Administrator',
    };
    return roleMap[profile.role] || 'User';
  }

  static getAvatarUrl(profile: UserProfile | null): string {
    if (!profile) return '';
    // Placeholder: integrate with avatar service if needed
    const initials = this.getInitials(profile);
    return `https://ui-avatars.com/api/?name=${initials}&background=0D8ABC&color=fff`;
  }

  static isDoctor(profile: UserProfile | null): boolean {
    return profile?.role === 'doctor';
  }

  static isPatient(profile: UserProfile | null): boolean {
    return profile?.role === 'patient';
  }

  static isAdmin(profile: UserProfile | null): boolean {
    return profile?.role === 'admin';
  }
}

export interface FormattedUserProfile extends UserProfile {
  fullName: string;
  initials: string;
  displayRole: string;
  avatarUrl: string;
}

export function formatUserProfile(profile: UserProfile | null): FormattedUserProfile | null {
  if (!profile) return null;

  return {
    ...profile,
    fullName: UserProfileFormatter.getFullName(profile),
    initials: UserProfileFormatter.getInitials(profile),
    displayRole: UserProfileFormatter.getDisplayRole(profile),
    avatarUrl: UserProfileFormatter.getAvatarUrl(profile),
  };
}
