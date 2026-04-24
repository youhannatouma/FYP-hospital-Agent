"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import apiClient from "@/lib/api-client";

export interface UserProfile {
  user_id: string;
  clerk_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: "doctor" | "patient" | "admin";
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

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  /** Derived helpers */
  fullName: string;
  initials: string;
  displayRole: string;
}

// Module-level cache so the profile is only fetched once per session
let profileCache: UserProfile | null = null;

export function useUserProfile(): UseUserProfileReturn {
  const { getToken, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(profileCache);
  const [isLoading, setIsLoading] = useState(!profileCache);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      setIsLoading(true);
      setError(null);
      const token = await getToken();
      const res = await apiClient.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: UserProfile = res.data;
      profileCache = data;
      setProfile(data);
    } catch (err: any) {
      console.error("[useUserProfile] Failed to fetch profile:", err);
      setError("Could not load profile");
      // Fallback: populate from Clerk data when backend is unavailable
      if (clerkUser) {
        const fallback: UserProfile = {
          user_id: "",
          clerk_id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
          first_name: clerkUser.firstName,
          last_name: clerkUser.lastName,
          role: ((clerkUser.publicMetadata as any)?.role as any) || "patient",
          status: "Active",
          phone_number: null,
          specialty: null,
          license_number: null,
          years_of_experience: null,
          qualifications: [],
          clinic_address: null,
          date_of_birth: null,
          gender: null,
          address: null,
          blood_type: null,
          allergies: [],
          chronic_conditions: [],
          emergency_contact: null,
          created_at: null,
        };
        setProfile(fallback);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, getToken, clerkUser]);

  useEffect(() => {
    if (!profileCache && isSignedIn) {
      fetchProfile();
    } else if (profileCache) {
      setIsLoading(false);
    }
  }, [isSignedIn, fetchProfile]);

  // Derived values
  const firstName = profile?.first_name || clerkUser?.firstName || "";
  const lastName = profile?.last_name || clerkUser?.lastName || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "User";
  const initials = [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase() || "U";

  const displayRole = (() => {
    if (!profile) return "";
    if (profile.role === "doctor") return profile.specialty ? `Dr. • ${profile.specialty}` : "Physician";
    if (profile.role === "admin") return "System Administrator";
    return "Patient";
  })();

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    fullName,
    initials,
    displayRole,
  };
}
