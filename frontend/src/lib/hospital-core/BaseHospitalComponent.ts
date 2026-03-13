/**
 * BaseHospitalComponent Superclass
 * Standardized interface for AI agents to interact with hospital data and actions.
 */
export class BaseHospitalComponent {
  role: 'admin' | 'patient' | 'doctor';
  apiBase: string;

  constructor(userRole: 'admin' | 'patient' | 'doctor') {
    this.role = userRole;
    this.apiBase = "/api/v1";
  }

  /**
   * Standardized data fetcher for any component
   */
  async fetchData<T>(endpoint: string): Promise<T | null> {
    try {
      // In a real app, this would be a real fetch. 
      // For this implementation, we might return mock data if the API doesn't exist.
      console.log(`[BaseHospital] Fetching from ${this.apiBase}${endpoint}`);
      const response = await fetch(`${this.apiBase}${endpoint}`);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error(`AI-Data Error: ${error}`);
      return null;
    }
  }

  /**
   * Unified Button Handler (The "Functional Buttons" logic)
   * Ensures every button in the app routes through this central registration.
   */
  async handleAction(actionType: string, payload: any): Promise<any> {
    console.log(`AI-Triggered Action: ${actionType}`, payload);
    
    const endpoints: Record<string, string> = {
      'book': '/appointments/create',
      'pay': '/payments/initiate',
      'delete_user': '/admin/users/delete',
      'approve_doctor': '/admin/doctors/approve',
      'update_status': '/admin/status/update',
      'cancel': 'back', // special case for navigation
    };

    if (endpoints[actionType] === 'back') {
      window.history.back();
      return { success: true };
    }

    const endpoint = endpoints[actionType];
    if (!endpoint) {
      console.warn(`Unregistered action: ${actionType}`);
      return { error: `Action ${actionType} not found` };
    }

    try {
      const response = await fetch(`${this.apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await response.json();
    } catch (error) {
      console.error(`Action Error: ${error}`);
      return { error: String(error) };
    }
  }
}
