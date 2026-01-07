// API simplifiée pour contourner les erreurs TypeScript

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/data-api'  // Vercel
  : '/.netlify/functions/data-api';  // Netlify local

export class SimpleApi {
  static async getClients(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`);
      const result = await response.json();
      return result.success ? (result.data || []) : [];
    } catch (error) {
      console.error('Error getting clients:', error);
      // Fallback sur localStorage
      const data = localStorage.getItem('clients');
      return data ? JSON.parse(data) : [];
    }
  }

  static async getJobApplications(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/jobApplications`);
      const result = await response.json();
      return result.success ? (result.data || []) : [];
    } catch (error) {
      console.error('Error getting applications:', error);
      // Fallback sur localStorage
      const data = localStorage.getItem('jobApplications');
      return data ? JSON.parse(data) : [];
    }
  }

  static async saveClient(client: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      const result = await response.json();
      
      if (result.success) {
        // Aussi sauvegarder en localStorage
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        clients.push(client);
        localStorage.setItem('clients', JSON.stringify(clients));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving client:', error);
      return false;
    }
  }

  static async saveJobApplication(application: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/jobApplications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application)
      });
      const result = await response.json();
      
      if (result.success) {
        // Aussi sauvegarder en localStorage
        const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        applications.push(application);
        localStorage.setItem('jobApplications', JSON.stringify(applications));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving application:', error);
      return false;
    }
  }

  static async updateJobApplication(id: string, updates: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/jobApplications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error updating application:', error);
      return false;
    }
  }

  static async deleteJobApplication(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/jobApplications/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      
      if (result.success) {
        // Mettre à jour localStorage
        const applications = JSON.parse(localStorage.getItem('jobApplications') || '[]');
        const updated = applications.filter((app: any) => app.id !== id);
        localStorage.setItem('jobApplications', JSON.stringify(updated));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting application:', error);
      return false;
    }
  }
}

export default SimpleApi;
