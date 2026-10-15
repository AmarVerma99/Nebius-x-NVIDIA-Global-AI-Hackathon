/**
 * OpsCopilot Frontend API Client
 * 
 * SECURITY RULE: All AI calls go through our backend server routes.
 * The frontend NEVER calls Nebius or exposes external AI provider keys directly.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AgentReasoningStep {
  step_number: number;
  phase: string;
  action: string;
  findings: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export interface RootCause {
  summary: string;
  primary_subsystem?: string;
  trigger_event?: string;
  impact_assessment?: string;
}

export interface SuggestedFix {
  summary: string;
  estimated_downtime?: string;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH';
  steps?: string[];
}

export interface SandboxResult {
  success: boolean;
  sandboxId: string;
  environment: string;
  exitCode: number;
  durationMs: number;
  stdout: string;
  stderr: string;
  executedAt: string;
  status: string;
}

export interface TavilySource {
  title: string;
  url: string;
  snippet: string;
  score: number;
  domain: string;
}

export interface Incident {
  id: string;
  user_id?: string | null;
  title: string;
  service_name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ANALYZING' | 'ROOT_CAUSE_IDENTIFIED' | 'FIX_RECOMMENDED' | 'RESOLVED' | 'CLOSED';
  environment: string;
  log_text: string;
  incident_description?: string;
  root_cause?: RootCause | string;
  confidence_score?: number;
  suggested_fix?: SuggestedFix | string;
  fix_script?: string;
  rollback_script?: string;
  agent_reasoning_steps?: AgentReasoningStep[];
  model_used?: string;
  alert_payload?: any;
  sandbox_result?: SandboxResult | null;
  tavily_sources?: TavilySource[] | string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  total: number;
  statusCounts: Record<string, number>;
  severityCounts: Record<string, number>;
  topServices: Array<{ service_name: string; count: number }>;
  recent: Array<{ id: string; title: string; service_name: string; severity: string; status: string; created_at: string }>;
  mttrMinutes: number;
  automatedFixSuccessRate: number;
}

class ApiService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('opscopilot_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({ success: false, message: 'Invalid JSON response from server' }));

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('opscopilot_token');
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // Health
  async getHealth() {
    return this.request<{ status: string; ai_provider: string; models_configured: any }>('/health');
  }

  // Auth
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      localStorage.setItem('opscopilot_token', res.token);
    }
    return res;
  }

  async register(name: string, email: string, password: string, role = 'sre_engineer'): Promise<{ success: boolean; token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    if (res.token) {
      localStorage.setItem('opscopilot_token', res.token);
    }
    return res;
  }

  async demoLogin(): Promise<{ success: boolean; token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/auth/demo-login', {
      method: 'POST',
    });
    if (res.token) {
      localStorage.setItem('opscopilot_token', res.token);
    }
    return res;
  }

  async getMe(): Promise<{ success: boolean; user: User }> {
    return this.request<{ success: boolean; user: User }>('/auth/me');
  }

  logout() {
    localStorage.removeItem('opscopilot_token');
  }

  // Incidents
  async getIncidents(params: { status?: string; severity?: string; service_name?: string; search?: string; limit?: string } = {}): Promise<{ success: boolean; count: number; data: Incident[] }> {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.severity) query.append('severity', params.severity);
    if (params.service_name) query.append('service_name', params.service_name);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; count: number; data: Incident[] }>(`/incidents${queryString}`);
  }

  async getIncidentById(id: string): Promise<{ success: boolean; data: Incident }> {
    return this.request<{ success: boolean; data: Incident }>(`/incidents/${id}`);
  }

  async getDashboardStats(): Promise<{ success: boolean; data: DashboardStats }> {
    return this.request<{ success: boolean; data: DashboardStats }>('/incidents/stats');
  }

  async updateIncidentStatus(id: string, status: string): Promise<{ success: boolean; data: Incident }> {
    return this.request<{ success: boolean; data: Incident }>(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteIncident(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/incidents/${id}`, {
      method: 'DELETE',
    });
  }

  async seedIncidents(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/incidents/seed', {
      method: 'POST',
    });
  }

  // Agent Operations
  async analyzeIncident(payload: {
    log_text: string;
    incident_description?: string;
    service_name: string;
    severity: string;
    environment: string;
    title?: string;
  }): Promise<{ success: boolean; data: Incident }> {
    return this.request<{ success: boolean; data: Incident }>('/agent/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async escalateIncident(id: string): Promise<{ success: boolean; message: string; data: Incident }> {
    return this.request<{ success: boolean; message: string; data: Incident }>(`/agent/escalate/${id}`, {
      method: 'POST',
    });
  }

  async searchTavily(id: string): Promise<{
    success: boolean;
    message: string;
    data: { incident: Incident; tavilyResult: { sources: TavilySource[]; tavily_answer: string; provider: string } };
  }> {
    return this.request<{
      success: boolean;
      message: string;
      data: { incident: Incident; tavilyResult: { sources: TavilySource[]; tavily_answer: string; provider: string } };
    }>(`/agent/tavily-search/${id}`, {
      method: 'POST',
    });
  }

  async executeSandbox(id: string, custom_script?: string): Promise<{
    success: boolean;
    message: string;
    data: { incident: Incident; sandboxResult: SandboxResult };
  }> {
    return this.request<{
      success: boolean;
      message: string;
      data: { incident: Incident; sandboxResult: SandboxResult };
    }>(`/agent/sandbox/${id}`, {
      method: 'POST',
      body: JSON.stringify({ custom_script }),
    });
  }
}

export const api = new ApiService();
export default api;
