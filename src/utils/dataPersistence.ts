// Système de persistance des données avec API Netlify Functions

import ApiService from './apiService'

export interface ClientData {
  id: string
  email: string
  fullName: string
  phone: string
  domicile?: string
  company?: string
  address: string
  city: string
  country: string
  createdAt: string
  lastLogin: string
  status: 'active' | 'inactive'
}

export interface ServiceRequestData {
  id: string
  clientId: string
  type: 'service' | 'contract' | 'project' | 'intervention' | 'quote' | 'invoice'
  title: string
  description: string
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  budget?: string
  deadline?: string
  createdAt: string
  updatedAt: string
  responses: Array<{
    id: string
    message: string
    sender: 'client' | 'admin'
    createdAt: string
    read: boolean
  }>
}

export interface VisitorData {
  timestamp: string
  userAgent: string
  language: string
  platform: string
  screenResolution: string
  referrer: string
  sessionId: string
  visitCount: number
}

export interface WebsiteStats {
  visitors: VisitorData[]
  totalVisits: number
  uniqueVisitorCount: number
  lastUpdated: string
}

class DataPersistence {
  private static instance: DataPersistence
  private readonly STORAGE_KEYS = {
    CLIENTS: 'fulbert_clients',
    SERVICE_REQUESTS: 'fulbert_service_requests',
    WEBSITE_STATS: 'fulbert_website_stats',
    JOB_APPLICATIONS: 'fulbert_job_applications',
    CURRENT_CLIENT: 'fulbert_current_client',
    ADMIN_AUTH: 'fulbert_admin_auth'
  }

  static getInstance(): DataPersistence {
    if (!DataPersistence.instance) {
      DataPersistence.instance = new DataPersistence()
    }
    return DataPersistence.instance
  }

  // Clients
  async getClients(): Promise<ClientData[]> {
    try {
      const clients = await ApiService.getClients();
      // Sauvegarder en cache pour accès hors ligne
      localStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      return clients;
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      // Fallback sur localStorage en cas d'erreur
      return this.getLocalClients();
    }
  }

  private getLocalClients(): ClientData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.CLIENTS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Erreur lors de la récupération locale des clients:', error)
      return []
    }
  }

  async saveClients(clients: ClientData[]): Promise<void> {
    try {
      // Sauvegarder sur le serveur
      for (const client of clients) {
        await ApiService.saveClient(client);
      }
      // Sauvegarder en cache local
      localStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      sessionStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des clients:', error);
      // Fallback sur localStorage
      localStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
      sessionStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    }
  }

  async addClient(client: ClientData): Promise<void> {
    const clients = await this.getClients();
    clients.push(client);
    await this.saveClients(clients);
  }

  async getClientByEmail(email: string): Promise<ClientData | null> {
    const clients = await this.getClients();
    return clients.find(client => client.email === email) || null;
  }

  async getClientById(id: string): Promise<ClientData | null> {
    const clients = await this.getClients();
    return clients.find(client => client.id === id) || null;
  }

  async updateClient(id: string, updates: Partial<ClientData>): Promise<void> {
    const clients = await this.getClients();
    const index = clients.findIndex(client => client.id === id);
    if (index !== -1) {
      clients[index] = { ...clients[index], ...updates };
      await this.saveClients(clients);
      // Mettre à jour directement sur le serveur aussi
      await ApiService.updateClient(id, updates);
    }
  }

  // Service Requests
  async getServiceRequests(): Promise<ServiceRequestData[]> {
    try {
      const requests = await ApiService.getServiceRequests();
      // Sauvegarder en cache pour accès hors ligne
      localStorage.setItem(this.STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(requests));
      return requests;
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      // Fallback sur localStorage
      return this.getLocalServiceRequests();
    }
  }

  private getLocalServiceRequests(): ServiceRequestData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SERVICE_REQUESTS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Erreur lors de la récupération locale des demandes:', error)
      return []
    }
  }

  async saveServiceRequests(requests: ServiceRequestData[]): Promise<void> {
    try {
      // Sauvegarder sur le serveur
      for (const request of requests) {
        await ApiService.saveServiceRequest(request);
      }
      // Sauvegarder en cache local
      localStorage.setItem(this.STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(requests));
      sessionStorage.setItem(this.STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(requests));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des demandes:', error);
      // Fallback sur localStorage
      localStorage.setItem(this.STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(requests));
      sessionStorage.setItem(this.STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(requests));
    }
  }

  async addServiceRequest(request: ServiceRequestData): Promise<void> {
    const requests = await this.getServiceRequests();
    requests.push(request);
    await this.saveServiceRequests(requests);
  }

  async updateServiceRequest(id: string, updates: Partial<ServiceRequestData>): Promise<void> {
    const requests = await this.getServiceRequests();
    const index = requests.findIndex(request => request.id === id);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates };
      await this.saveServiceRequests(requests);
      // Mettre à jour directement sur le serveur
      await ApiService.updateServiceRequest(id, updates);
    }
  }

  async getServiceRequestsByClientId(clientId: string): Promise<ServiceRequestData[]> {
    const requests = await this.getServiceRequests();
    return requests.filter(request => request.clientId === clientId);
  }

  // Website Stats
  async getWebsiteStats(): Promise<WebsiteStats> {
    try {
      const stats = await ApiService.getWebsiteStats();
      // Sauvegarder en cache pour accès hors ligne
      localStorage.setItem(this.STORAGE_KEYS.WEBSITE_STATS, JSON.stringify(stats));
      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      // Fallback sur localStorage
      return this.getLocalWebsiteStats();
    }
  }

  private getLocalWebsiteStats(): WebsiteStats {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.WEBSITE_STATS)
      if (data) {
        const stats = JSON.parse(data)
        return {
          ...stats,
          uniqueVisitors: new Set(stats.visitors?.map((v: VisitorData) => v.sessionId))
        }
      }
      return {
        visitors: [],
        totalVisits: 0,
        uniqueVisitorCount: 0,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Erreur lors de la récupération locale des statistiques:', error)
      return {
        visitors: [],
        totalVisits: 0,
        uniqueVisitorCount: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  async saveWebsiteStats(stats: WebsiteStats): Promise<void> {
    try {
      // Sauvegarder sur le serveur
      await ApiService.updateWebsiteStats(stats);
      // Sauvegarder en cache local
      localStorage.setItem(this.STORAGE_KEYS.WEBSITE_STATS, JSON.stringify(stats));
      sessionStorage.setItem(this.STORAGE_KEYS.WEBSITE_STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des statistiques:', error);
      // Fallback sur localStorage
      localStorage.setItem(this.STORAGE_KEYS.WEBSITE_STATS, JSON.stringify(stats));
      sessionStorage.setItem(this.STORAGE_KEYS.WEBSITE_STATS, JSON.stringify(stats));
    }
  }

  async addVisitor(visitor: VisitorData): Promise<void> {
    const stats = await this.getWebsiteStats();
    stats.visitors.unshift(visitor);
    stats.totalVisits++;
    stats.uniqueVisitorCount = new Set(stats.visitors.map(v => v.sessionId)).size;
    stats.lastUpdated = new Date().toISOString();
    
    // Limiter à 1000 visiteurs pour éviter la surcharge
    if (stats.visitors.length > 1000) {
      stats.visitors = stats.visitors.slice(0, 1000);
    }
    
    await this.saveWebsiteStats(stats);
  }

  // Job Applications
  async getJobApplications(): Promise<any[]> {
    try {
      const applications = await ApiService.getJobApplications();
      // Sauvegarder en cache pour accès hors ligne
      localStorage.setItem(this.STORAGE_KEYS.JOB_APPLICATIONS, JSON.stringify(applications));
      return applications;
    } catch (error) {
      console.error('Erreur lors de la récupération des candidatures:', error);
      // Fallback sur localStorage
      return this.getLocalJobApplications();
    }
  }

  private getLocalJobApplications(): any[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.JOB_APPLICATIONS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Erreur lors de la récupération locale des candidatures:', error)
      return []
    }
  }

  async saveJobApplications(applications: any[]): Promise<void> {
    try {
      // Sauvegarder sur le serveur
      for (const application of applications) {
        await ApiService.saveJobApplication(application);
      }
      // Sauvegarder en cache local
      localStorage.setItem(this.STORAGE_KEYS.JOB_APPLICATIONS, JSON.stringify(applications));
      sessionStorage.setItem(this.STORAGE_KEYS.JOB_APPLICATIONS, JSON.stringify(applications));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des candidatures:', error);
      // Fallback sur localStorage
      localStorage.setItem(this.STORAGE_KEYS.JOB_APPLICATIONS, JSON.stringify(applications));
      sessionStorage.setItem(this.STORAGE_KEYS.JOB_APPLICATIONS, JSON.stringify(applications));
    }
  }

  async addJobApplication(application: any): Promise<void> {
    const applications = await this.getJobApplications();
    applications.push(application);
    await this.saveJobApplications(applications);
  }

  // Current Client
  getCurrentClient(): ClientData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.CURRENT_CLIENT)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Erreur lors de la récupération du client actuel:', error)
      return null
    }
  }

  setCurrentClient(client: ClientData | null): void {
    try {
      if (client) {
        localStorage.setItem(this.STORAGE_KEYS.CURRENT_CLIENT, JSON.stringify(client))
        sessionStorage.setItem(this.STORAGE_KEYS.CURRENT_CLIENT, JSON.stringify(client))
      } else {
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_CLIENT)
        sessionStorage.removeItem(this.STORAGE_KEYS.CURRENT_CLIENT)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du client actuel:', error)
    }
  }

  // Admin Auth
  isAdminAuthenticated(): boolean {
    try {
      return localStorage.getItem(this.STORAGE_KEYS.ADMIN_AUTH) === 'true'
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'auth admin:', error)
      return false
    }
  }

  setAdminAuthenticated(authenticated: boolean): void {
    try {
      if (authenticated) {
        localStorage.setItem(this.STORAGE_KEYS.ADMIN_AUTH, 'true')
        sessionStorage.setItem(this.STORAGE_KEYS.ADMIN_AUTH, 'true')
      } else {
        localStorage.removeItem(this.STORAGE_KEYS.ADMIN_AUTH)
        sessionStorage.removeItem(this.STORAGE_KEYS.ADMIN_AUTH)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'auth admin:', error)
    }
  }

  // Migration depuis les anciennes clés et localStorage vers l'API
  async migrateOldData(): Promise<void> {
    try {
      // D'abord migrer depuis les anciennes clés localStorage
      const oldClients = localStorage.getItem('clients')
      const oldRequests = localStorage.getItem('serviceRequests')
      const oldStats = localStorage.getItem('websiteStats')
      const oldApplications = localStorage.getItem('jobApplications')
      const oldAuth = localStorage.getItem('isAdminAuthenticated')

      let hasOldData = false

      // Migration des clients
      if (oldClients && !localStorage.getItem(this.STORAGE_KEYS.CLIENTS)) {
        localStorage.setItem(this.STORAGE_KEYS.CLIENTS, oldClients)
        hasOldData = true
      }

      // Migration des demandes
      if (oldRequests && !localStorage.getItem(this.STORAGE_KEYS.SERVICE_REQUESTS)) {
        localStorage.setItem(this.STORAGE_KEYS.SERVICE_REQUESTS, oldRequests)
        hasOldData = true
      }

      // Migration des stats
      if (oldStats && !localStorage.getItem(this.STORAGE_KEYS.WEBSITE_STATS)) {
        localStorage.setItem(this.STORAGE_KEYS.WEBSITE_STATS, oldStats)
        hasOldData = true
      }

      // Migration des candidatures
      if (oldApplications && !localStorage.getItem(this.STORAGE_KEYS.JOB_APPLICATIONS)) {
        localStorage.setItem(this.STORAGE_KEYS.JOB_APPLICATIONS, oldApplications)
        hasOldData = true
      }

      // Migration de l'auth admin
      if (oldAuth && !localStorage.getItem(this.STORAGE_KEYS.ADMIN_AUTH)) {
        localStorage.setItem(this.STORAGE_KEYS.ADMIN_AUTH, oldAuth)
      }

      // Si on a des données anciennes, les migrer vers l'API
      if (hasOldData) {
        console.log('Migration des données locales vers l\'API...')
        await ApiService.migrateFromLocalStorage()
        console.log('Migration terminée')
      }
    } catch (error) {
      console.error('Erreur lors de la migration des données:', error)
    }
  }

  // Export des données pour backup
  async exportAllData(): Promise<string> {
    const data = {
      clients: await this.getClients(),
      serviceRequests: await this.getServiceRequests(),
      websiteStats: await this.getWebsiteStats(),
      jobApplications: await this.getJobApplications(),
      exportDate: new Date().toISOString()
    }
    return JSON.stringify(data, null, 2)
  }

  // Import des données
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.clients) {
        this.saveClients(data.clients)
      }
      
      if (data.serviceRequests) {
        this.saveServiceRequests(data.serviceRequests)
      }
      
      if (data.websiteStats) {
        this.saveWebsiteStats(data.websiteStats)
      }
      
      if (data.jobApplications) {
        this.saveJobApplications(data.jobApplications)
      }
      
      return true
    } catch (error) {
      console.error('Erreur lors de l\'import des données:', error)
      return false
    }
  }
}

export default DataPersistence.getInstance()
