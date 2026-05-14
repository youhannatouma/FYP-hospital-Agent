import { ApiRequestHelper } from '../api-request-helper';

export interface HealthGoal {
  id: string;
  title: string;
  description: string | null;
  target_value: string;
  current_value: string | null;
  progress: number;
  category: string | null;
  status: string;
  created_at: string;
  target_date: string | null;
}

export interface CreateHealthGoalDto {
  title: string;
  description?: string;
  target_value: string;
  current_value?: string;
  progress_percentage?: number;
  category?: string;
  target_date?: string;
}

export interface IHealthGoalRepository {
  getMyGoals(): Promise<HealthGoal[]>;
  createGoal(data: CreateHealthGoalDto): Promise<{ goal_id: string; status: string }>;
  updateGoal(id: string, data: Partial<HealthGoal>): Promise<void>;
  deleteGoal(id: string): Promise<void>;
}

export class HealthGoalRepository implements IHealthGoalRepository {
  constructor(private apiHelper: ApiRequestHelper) {}

  async getMyGoals(): Promise<HealthGoal[]> {
    return this.apiHelper.get<HealthGoal[]>('/health-goals/');
  }

  async createGoal(data: CreateHealthGoalDto): Promise<{ goal_id: string; status: string }> {
    return this.apiHelper.post<{ goal_id: string; status: string }>('/health-goals/', data);
  }

  async updateGoal(id: string, data: Partial<HealthGoal>): Promise<void> {
    await this.apiHelper.patch(`/health-goals/${id}`, data);
  }

  async deleteGoal(id: string): Promise<void> {
    await this.apiHelper.delete(`/health-goals/${id}`);
  }
}

let healthGoalRepositoryInstance: IHealthGoalRepository | null = null;

export function getHealthGoalRepository(apiHelper?: ApiRequestHelper): IHealthGoalRepository {
  if (!healthGoalRepositoryInstance) {
    const { getApiRequestHelper } = require('../api-request-helper');
    healthGoalRepositoryInstance = new HealthGoalRepository(
      apiHelper || getApiRequestHelper()
    );
  }
  return healthGoalRepositoryInstance;
}
