import { useState, useEffect, useCallback } from "react"
import { getServiceContainer } from "@/lib/services/service-container"
import type { HealthGoal, CreateHealthGoalDto } from "@/lib/services/repositories/health-goal-repository"

export function useHealthGoals() {
  const [goals, setGoals] = useState<HealthGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      const container = getServiceContainer()
      const data = await container.healthGoal.getMyGoals()
      setGoals(data)
      setError(null)
    } catch (err) {
      console.error("[useHealthGoals] Failed to fetch goals:", err)
      setError("Failed to load health goals")
    } finally {
      setLoading(false)
    }
  }, [])

  const addGoal = async (data: CreateHealthGoalDto) => {
    try {
      const container = getServiceContainer()
      await container.healthGoal.createGoal(data)
      await fetchGoals()
    } catch (err) {
      console.error("[useHealthGoals] Failed to add goal:", err)
      throw err
    }
  }

  const updateGoal = async (id: string, data: Partial<HealthGoal>) => {
    try {
      const container = getServiceContainer()
      await container.healthGoal.updateGoal(id, data)
      await fetchGoals()
    } catch (err) {
      console.error("[useHealthGoals] Failed to update goal:", err)
      throw err
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      const container = getServiceContainer()
      await container.healthGoal.deleteGoal(id)
      await fetchGoals()
    } catch (err) {
      console.error("[useHealthGoals] Failed to delete goal:", err)
      throw err
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  return {
    goals,
    loading,
    error,
    refresh: fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal
  }
}
