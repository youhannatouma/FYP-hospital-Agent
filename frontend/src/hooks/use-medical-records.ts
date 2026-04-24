import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import apiClient from "@/lib/api-client";

export function useMedicalRecords() {
  const { isLoaded, isSignedIn } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = async () => {
    if (!isLoaded || !isSignedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.get("/medical-records/my");
      setRecords(res.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch medical records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [isLoaded, isSignedIn]);

  return {
    records,
    loading,
    error,
    refetch: fetchRecords,
  };
}
