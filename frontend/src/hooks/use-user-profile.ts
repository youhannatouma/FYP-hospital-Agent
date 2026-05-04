// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { getServiceContainer } from "@/lib/services/service-container";
import { UserProfile } from "@/lib/services/repositories/user-repository";
import { formatUserProfile, FormattedUserProfile } from "@/lib/services/user-profile-formatter";
import { classifyHttpError } from "@/lib/network/http-error";

interface UseUserProfileReturn {
  profile: FormattedUserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  // Convenience accessors for backward compatibility
  fullName: string;
  initials: string;
  displayRole: string;
}

// Module-level cache to fetch profile only once per session
let profileCache: UserProfile | null = null;
export function clearUserProfileCache(): void {
  profileCache = null;
}

/**
 * useUserProfile Hook
 * Follows: Single Responsibility Principle (SRP)
 * - Only handles state and side effects
 * - Delegates data transformation to UserProfileFormatter
 * - Delegates data fetching to UserRepository
 */
export function useUserProfile(): UseUserProfileReturn {
  const { isSignedIn } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(profileCache);
  const [isLoading, setIsLoading] = useState<boolean>(
    !profileCache && (isSignedIn ?? false)
  );
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isSignedIn) {
      setProfile(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Use dependency-injected repository
      const container = getServiceContainer();
      const user = await container.user.getCurrentUser();
      
      profileCache = user;
      setProfile(user);
    } catch (err: unknown) {
      console.error("[useUserProfile] Failed to fetch profile:", err);
      const details = classifyHttpError(err);
      if (details.kind === "network_unreachable") {
        setError("Could not reach backend API. Ensure backend is running at http://localhost:8000.");
      } else {
        setError(err?.response?.data?.message || "Could not load profile");
      }
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isSignedIn && !profileCache) {
      fetchProfile();
    }
  }, [isSignedIn, fetchProfile]);

  const formattedProfile = formatUserProfile(profile);

  return {
    profile: formattedProfile,
    isLoading,
    error,
    refetch: fetchProfile,
    // Convenience accessors derived from FormattedUserProfile
    fullName: formattedProfile?.fullName ?? '',
    initials: formattedProfile?.initials ?? '?',
    displayRole: formattedProfile?.displayRole ?? 'User',
  };
}

/**
 * Hook for accessing only specific user info
 * Follows: Interface Segregation Principle (ISP)
 */
export function useUserBasicInfo() {
  const { profile, isLoading, error } = useUserProfile();

  return {
    fullName: profile?.fullName ?? '',
    email: profile?.email ?? '',
    role: profile?.role ?? 'patient',
    initials: profile?.initials ?? '?',
    isLoading,
    error,
  };
}

/**
 * Hook for doctor-specific profile info
 * Follows: Single Responsibility & Interface Segregation
 */
export function useDoctorProfile() {
  const { profile, isLoading, error } = useUserProfile();

  if (profile?.role !== 'doctor') {
    return {
      profile: null,
      isLoading,
      error: error || 'User is not a doctor',
    };
  }

  return {
    profile,
    specialty: profile.specialty,
    licenseNumber: profile.license_number,
    yearsOfExperience: profile.years_of_experience,
    qualifications: profile.qualifications,
    clinicAddress: profile.clinic_address,
    isLoading,
    error,
  };
}

/**
 * Hook for patient-specific profile info
 * Follows: Single Responsibility & Interface Segregation
 */
export function usePatientProfile() {
  const { profile, isLoading, error } = useUserProfile();

  if (profile?.role !== 'patient') {
    return {
      profile: null,
      isLoading,
      error: error || 'User is not a patient',
    };
  }

  return {
    profile,
    dateOfBirth: profile.date_of_birth,
    gender: profile.gender,
    address: profile.address,
    bloodType: profile.blood_type,
    allergies: profile.allergies,
    chronicConditions: profile.chronic_conditions,
    emergencyContact: profile.emergency_contact,
    isLoading,
    error,
  };
}
