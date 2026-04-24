import { managers } from "@/lib/hospital-core/Managers";

/**
 * useHospital Hook
 * Provides easy access to the agentic managers for functional components.
 */
export function useHospital() {
  return {
    booking: managers.booking,
    admin: managers.admin,
    payment: managers.payment,
    medicalRecords: managers.medicalRecords,
    stats: managers.stats,
    
    /**
     * Helper to wrap any action with logging or agent hooks.
     */
    runAction: async (actionType: string, payload: any) => {
      // In the future, this could trigger an AI notification or global state change
      return await managers.booking.handleAction(actionType, payload);
    }
  };
}
