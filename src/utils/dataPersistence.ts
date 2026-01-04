// Système de persistance des données pour le déploiement Netlify

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
  getClients(): ClientData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.CLIENTS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error)
      return []
    }
  }

  saveClients(clients: ClientData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify(clients))
      // Sauvegarde de secours dans sessionStorage
      sessionStorage.setItem(this.STORAGE_KEYS.CLIENTS, JSON.stringify(clients))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des clients:', error)
    }
  }

  addClient(client: ClientData): void {
    const clients = this.getClients()
    clients.push(client)
    this.saveClients(clients)
  }

  getClientByEmail(email: string): ClientData | null {
    const clients = this.getClients()
    return clients.find(client => client.email === email) || null
  }

  getClientById(id: string): ClientData | null {
    const clients = this.getClients()
    return clients.find(client => client.id === id) || null
  }

  updateClient(id: string, updates: Partial<ClientData>): void {
    const clients = this.getClients()
    const index = clients.findIndex(client => client.id === id)
    if (index !== -1) {
      clients[index] = { ...clients[index], ...updates }
      this.saveClients(clients)
    }
  }

  // Service Requests
  getServiceRequests(): ServiceRequestData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SERVICE_REQUESTS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error)
      return []
    }
  }

  saveServiceRequests(requests: ServiceRequestData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(requests))
      // Sauvegarde de secours dans sessionStorage
      sessionStorage.setItem(this.STORAGE_KEYS.SERVICE_REQUESTS, JSON.stringify(requests))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des demandes:', error)
    }
  }

  addServiceRequest(request: ServiceRequestData): void {
    const requests = this.getServiceRequests()
    requests.push(request)
    this.saveServiceRequests(requests)
  }

  updateServiceRequest(id: string, updates: Partial<ServiceRequestData>): void {
    const requests = this.getServiceRequests()
    const index = requests.findIndex(request => request.id === id)
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates }
      this.saveServiceRequests(requests)
    }
  }

  getServiceRequestsByClientId(clientId: string): ServiceRequestData[] {
    const requests = this.getServiceRequests()
    return requests.filter(request => request.clientId === clientId)
  }

  // Website Stats
  getWebsiteStats(): WebsiteStats {
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
      console.error('Erreur lors de la récupération des statistiques:', error)
      return {
        visitors: [],
        totalVisits: 0,
        uniqueVisitorCount: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  saveWebsiteStats(stats: WebsiteStats): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.WEBSITE_STATS, JSON.stringify(stats))
      // Sauvegarde de secours dans sessionStorage
      sessionStorage.setItem(this.STORAGE_KEYS.WEBSITE_STATS, JSON.stringify(stats))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des statistiques:', error)
    }
  }

  addVisitor(visitor: VisitorData): void {
    const stats = this.getWebsiteStats()
    stats.visitors.unshift(visitor)
    stats.totalVisits++
    stats.uniqueVisitorCount = new Set(stats.visitors.map(v => v.sessionId)).size
    stats.lastUpdated = new Date().toISOString()
    
    // Limiter à 1000 visiteurs pour éviter la surcharge
    if (stats.visitors.length > 1000) {
      stats.visitors = stats.visitors.slice(0, 1000)
    }
    
    this.saveWebsiteStats(stats)
  }

  // Job Applications
  getJobApplications(): any[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.JOB_APPLICATIONS)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Erreur lors de la récupération des candidatures:', error)
      return []
    }
  }

  saveJobApplications(applications: any[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.JOB_APPLICATIONS, JSON.stringify(applications))
      sessionStorage.setItem(this.STORAGE_KEYS.JOB_APPLICATIONS, JSON.stringify(applications))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des candidatures:', error)
    }
  }

  addJobApplication(application: any): void {
    const applications = this.getJobApplications()
    applications.push(application)
    this.saveJobApplications(applications)
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

  // Migration depuis les anciennes clés
  migrateOldData(): void {
    try {
      // Migration des clients
      const oldClients = localStorage.getItem('clients')
      if (oldClients && !localStorage.getItem(this.STORAGE_KEYS.CLIENTS)) {
        localStorage.setItem(this.STORAGE_KEYS.CLIENTS, oldClients)
      }

      // Migration des demandes
      const oldRequests = localStorage.getItem('serviceRequests')
      if (oldRequests && !localStorage.getItem(this.STORAGE_KEYS.SERVICE_REQUESTS)) {
        localStorage.setItem(this.STORAGE_KEYS.SERVICE_REQUESTS, oldRequests)
      }

      // Migration des stats
      const oldStats = localStorage.getItem('websiteStats')
      if (oldStats && !localStorage.getItem(this.STORAGE_KEYS.WEBSITE_STATS)) {
        localStorage.setItem(this.STORAGE_KEYS.WEBSITE_STATS, oldStats)
      }

      // Migration des candidatures
      const oldApplications = localStorage.getItem('jobApplications')
      if (oldApplications && !localStorage.getItem(this.STORAGE_KEYS.JOB_APPLICATIONS)) {
        localStorage.setItem(this.STORAGE_KEYS.JOB_APPLICATIONS, oldApplications)
      }

      // Migration de l'auth admin
      const oldAuth = localStorage.getItem('isAdminAuthenticated')
      if (oldAuth && !localStorage.getItem(this.STORAGE_KEYS.ADMIN_AUTH)) {
        localStorage.setItem(this.STORAGE_KEYS.ADMIN_AUTH, oldAuth)
      }

      console.log('Migration des données terminée')
    } catch (error) {
      console.error('Erreur lors de la migration des données:', error)
    }
  }

  // Export des données pour backup
  exportAllData(): string {
    const data = {
      clients: this.getClients(),
      serviceRequests: this.getServiceRequests(),
      websiteStats: this.getWebsiteStats(),
      jobApplications: this.getJobApplications(),
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
