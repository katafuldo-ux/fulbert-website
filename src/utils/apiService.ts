// Service API pour interagir avec le backend (Netlify Functions ou Vercel)

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/data-api'  // Vercel
  : '/.netlify/functions/data-api';  // Netlify local

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur réseau'
      };
    }
  }

  // Clients
  async getClients(): Promise<any[]> {
    const response = await this.request<any[]>('/clients');
    return response.success ? (response.data || []) : [];
  }

  async saveClient(client: any): Promise<boolean> {
    const response = await this.request<any>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
    return response.success;
  }

  async updateClient(id: string, updates: any): Promise<boolean> {
    const response = await this.request<any>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.success;
  }

  async deleteClient(id: string): Promise<boolean> {
    const response = await this.request<any>(`/clients/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  }

  // Job Applications
  async getJobApplications(): Promise<any[]> {
    const response = await this.request<any[]>('/jobApplications');
    return response.success ? (response.data || []) : [];
  }

  async saveJobApplication(application: any): Promise<boolean> {
    const response = await this.request<any>('/jobApplications', {
      method: 'POST',
      body: JSON.stringify(application),
    });
    return response.success;
  }

  async updateJobApplication(id: string, updates: any): Promise<boolean> {
    const response = await this.request<any>(`/jobApplications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.success;
  }

  async deleteJobApplication(id: string): Promise<boolean> {
    const response = await this.request<any>(`/jobApplications/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  }

  // Service Requests
  async getServiceRequests(): Promise<any[]> {
    const response = await this.request<any[]>('/serviceRequests');
    return response.success ? (response.data || []) : [];
  }

  async saveServiceRequest(request: any): Promise<boolean> {
    const response = await this.request<any>('/serviceRequests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.success;
  }

  async updateServiceRequest(id: string, updates: any): Promise<boolean> {
    const response = await this.request<any>(`/serviceRequests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.success;
  }

  async deleteServiceRequest(id: string): Promise<boolean> {
    const response = await this.request<any>(`/serviceRequests/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  }

  // Client Requests
  async getClientRequests(): Promise<any[]> {
    const response = await this.request<any[]>('/clientRequests');
    return response.success ? (response.data || []) : [];
  }

  async saveClientRequest(request: any): Promise<boolean> {
    const response = await this.request<any>('/clientRequests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.success;
  }

  async updateClientRequest(id: string, updates: any): Promise<boolean> {
    const response = await this.request<any>(`/clientRequests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.success;
  }

  async deleteClientRequest(id: string): Promise<boolean> {
    const response = await this.request<any>(`/clientRequests/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  }

  // Website Stats
  async getWebsiteStats(): Promise<any> {
    const response = await this.request<any>('/websiteStats');
    return response.success ? (response.data || {
      visitors: [],
      totalVisits: 0,
      uniqueVisitorCount: 0,
      lastUpdated: new Date().toISOString()
    }) : {
      visitors: [],
      totalVisits: 0,
      uniqueVisitorCount: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  async updateWebsiteStats(stats: any): Promise<boolean> {
    const response = await this.request<any>('/websiteStats', {
      method: 'POST',
      body: JSON.stringify(stats),
    });
    return response.success;
  }

  // User Accounts
  async getUserAccounts(): Promise<any[]> {
    const response = await this.request<any[]>('/userAccounts');
    return response.success ? (response.data || []) : [];
  }

  async saveUserAccount(account: any): Promise<boolean> {
    const response = await this.request<any>('/userAccounts', {
      method: 'POST',
      body: JSON.stringify(account),
    });
    return response.success;
  }

  async updateUserAccount(id: string, updates: any): Promise<boolean> {
    const response = await this.request<any>(`/userAccounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.success;
  }

  async deleteUserAccount(id: string): Promise<boolean> {
    const response = await this.request<any>(`/userAccounts/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  }

  // Utilitaire pour récupérer toutes les données
  async getAllData(): Promise<any> {
    const response = await this.request<any>('/all');
    return response.success ? (response.data || {}) : {};
  }

  // Migration des données depuis localStorage vers l'API
  async migrateFromLocalStorage(): Promise<boolean> {
    try {
      const localStorageData = {
        clients: JSON.parse(localStorage.getItem('fulbert_clients') || '[]'),
        jobApplications: JSON.parse(localStorage.getItem('fulbert_job_applications') || '[]'),
        serviceRequests: JSON.parse(localStorage.getItem('fulbert_service_requests') || '[]'),
        websiteStats: JSON.parse(localStorage.getItem('fulbert_website_stats') || '{}'),
        userAccounts: JSON.parse(localStorage.getItem('userAccounts') || '[]'),
        clientRequests: JSON.parse(localStorage.getItem('clientRequests') || '[]')
      };

      // Envoyer toutes les données d'un coup
      const response = await fetch(`${API_BASE_URL}/all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localStorageData),
      });

      return response.ok;
    } catch (error) {
      console.error('Migration error:', error);
      return false;
    }
  }
}

export default new ApiService();
