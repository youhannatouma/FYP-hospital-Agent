import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import apiClient from "@/lib/api-client";

export function usePrescriptions() {
  const { isLoaded, isSignedIn } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptions = async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.get("/prescriptions/my");
      setPrescriptions(res.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch prescriptions");
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [isLoaded, isSignedIn]);

  return {
    prescriptions,
    loading,
    error,
    refetch: fetchPrescriptions,
  };
}
