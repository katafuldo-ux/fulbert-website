// Gestionnaire de comptes et sessions en temps réel
// Scripts professionnels et rigides pour la capture et synchronisation des données

export interface RealTimeSession {
  id: string
  userId: string
  sessionId: string
  startTime: string
  lastActivity: string
  currentIp: string
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet'
    browser: string
    os: string
    userAgent: string
    screenResolution: string
    language: string
    timezone: string
  }
  location: {
    country: string
    city: string
    region?: string
    latitude?: number
    longitude?: number
    isp: string
    vpnDetected: boolean
    proxyDetected: boolean
  }
  security: {
    fingerprint: string
    sslEnabled: boolean
    connectionType: string
    riskScore: number
  }
  activity: {
    pageViews: number
    actionsCount: number
    duration: number
    lastPage: string
    isActive: boolean
  }
}

export interface UserAccount {
  id: string
  email: string
  fullName: string
  phone?: string
  company?: string
  role: 'admin' | 'client' | 'visitor'
  status: 'active' | 'inactive' | 'suspended' | 'banned'
  createdAt: string
  lastLogin: string
  loginCount: number
  currentSession?: RealTimeSession
  allSessions: RealTimeSession[]
  security: {
    twoFactorEnabled: boolean
    lastPasswordChange: string
    failedAttempts: number
    accountLocked: boolean
    permissions: string[]
    trustedDevices: string[]
  }
  network: {
    ipHistory: Array<{
      ip: string
      timestamp: string
      location: string
      device: string
    }>
    currentIp: string
    isp: string
    vpnDetected: boolean
    lastLocation: string
  }
}

class AccountManager {
  private static instance: AccountManager
  private updateInterval: NodeJS.Timeout | null = null
  private sessionTracking: Map<string, RealTimeSession> = new Map()

  static getInstance(): AccountManager {
    if (!AccountManager.instance) {
      AccountManager.instance = new AccountManager()
    }
    return AccountManager.instance
  }

  // Détecter le type d'appareil avec précision
  private detectDeviceType(): 'desktop' | 'mobile' | 'tablet' {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/tablet|ipad|playbook|silk|(android(?!.*mobi))/i.test(userAgent)) {
      return 'tablet'
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile'
    }
    return 'desktop'
  }

  // Extraire les informations du navigateur
  private getBrowserInfo(): { name: string; version: string } {
    const userAgent = navigator.userAgent
    let browserName = 'Unknown'
    let browserVersion = 'Unknown'

    if (userAgent.indexOf('Chrome') > -1) {
      browserName = 'Chrome'
      const match = userAgent.match(/Chrome\/(\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
    } else if (userAgent.indexOf('Safari') > -1) {
      browserName = 'Safari'
      const match = userAgent.match(/Version\/(\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
    } else if (userAgent.indexOf('Firefox') > -1) {
      browserName = 'Firefox'
      const match = userAgent.match(/Firefox\/(\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
    } else if (userAgent.indexOf('Edge') > -1) {
      browserName = 'Edge'
      const match = userAgent.match(/Edge\/(\d+)/)
      browserVersion = match ? match[1] : 'Unknown'
    }

    return { name: browserName, version: browserVersion }
  }

  // Extraire les informations du système d'exploitation
  private getOSInfo(): string {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.indexOf('win') > -1) return 'Windows'
    if (userAgent.indexOf('mac') > -1) return 'macOS'
    if (userAgent.indexOf('linux') > -1) return 'Linux'
    if (userAgent.indexOf('android') > -1) return 'Android'
    if (userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1) return 'iOS'
    
    return 'Unknown'
  }

  // Générer un fingerprint unique pour l'appareil
  private generateFingerprint(): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillText('Device fingerprint', 2, 2)
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')
    
    return btoa(fingerprint).substring(0, 32)
  }

  // Obtenir l'IP réelle et les informations de localisation
  async getRealIPInfo(): Promise<{
    ip: string
    country: string
    city: string
    region?: string
    latitude?: number
    longitude?: number
    isp: string
    vpnDetected: boolean
    proxyDetected: boolean
  }> {
    try {
      // Utiliser multiple services pour la détection VPN/Proxy
      const responses = await Promise.allSettled([
        fetch('https://api.ipify.org?format=json'),
        fetch('https://ipapi.co/json/'),
        fetch('https://api.ipgeolocation.io/ipgeo')
      ])

      let ip = 'Unknown'
      let country = 'Unknown'
      let city = 'Unknown'
      let region = undefined
      let latitude = undefined
      let longitude = undefined
      let isp = 'Unknown'

      // Analyser les réponses
      for (const response of responses) {
        if (response.status === 'fulfilled') {
          try {
            const data = await response.value
            const parsed = await data.json()
            if (parsed.ip) ip = parsed.ip
            if (parsed.country_name) country = parsed.country_name
            if (parsed.city) city = parsed.city
            if (parsed.region) region = parsed.region
            if (parsed.latitude) latitude = parsed.latitude
            if (parsed.longitude) longitude = parsed.longitude
            if (parsed.org) isp = parsed.org
          } catch (e) {
            console.warn('Failed to parse IP response:', e)
          }
        }
      }

      // Détection basique de VPN/Proxy
      const vpnDetected = await this.detectVPN()
      const proxyDetected = await this.detectProxy()

      return {
        ip,
        country,
        city,
        region,
        latitude,
        longitude,
        isp,
        vpnDetected,
        proxyDetected
      }
    } catch (error) {
      console.error('Error getting IP info:', error)
      return {
        ip: 'Error',
        country: 'Unknown',
        city: 'Unknown',
        isp: 'Unknown',
        vpnDetected: false,
        proxyDetected: false
      }
    }
  }

  // Détection de VPN (méthodes multiples)
  private async detectVPN(): Promise<boolean> {
    try {
      // Vérifier les headers typiques de VPN
      const headers = new Headers()
      const response = await fetch('https://httpbin.org/headers', { headers })
      const data = await response.json()
      
      const vpnHeaders = [
        'x-forwarded-for',
        'x-real-ip',
        'x-client-ip',
        'cf-connecting-ip',
        'x-cluster-client-ip'
      ]
      
      const hasVPNHeaders = vpnHeaders.some(header => data.headers[header])
      if (hasVPNHeaders) return true

      // Vérifier les plages d'IP connues pour VPN
      const ipInfo = await this.getRealIPInfo()
      const knownVPNRanges = [
        '10.', '172.', '192.168.', // Private IPs
        '100.64', '100.65', '100.66', // CG-NAT
        '127.' // Loopback
      ]
      
      return knownVPNRanges.some(range => ipInfo.ip.startsWith(range))
    } catch (error) {
      return false
    }
  }

  // Détection de Proxy
  private async detectProxy(): Promise<boolean> {
    try {
      // Vérifier WebRTC pour détecter les proxies
      return new Promise((resolve) => {
        const rtc = new RTCPeerConnection({ iceServers: [] })
        rtc.createDataChannel('')
        rtc.createOffer()
          .then((offer) => rtc.setLocalDescription(offer))
          .catch(() => resolve(false))
        
        setTimeout(() => {
          const localDescription = rtc.localDescription
          if (localDescription && localDescription.sdp) {
            const hasProxy = localDescription.sdp.includes('typ relay')
            resolve(hasProxy)
          } else {
            resolve(false)
          }
          rtc.close()
        }, 1000)
      })
    } catch (error) {
      return false
    }
  }

  // Créer une nouvelle session en temps réel
  async createRealTimeSession(userId: string): Promise<RealTimeSession> {
    const now = new Date().toISOString()
    const browserInfo = this.getBrowserInfo()
    const ipInfo = await this.getRealIPInfo()
    const fingerprint = this.generateFingerprint()

    const session: RealTimeSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      sessionId: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: now,
      lastActivity: now,
      currentIp: ipInfo.ip,
      deviceInfo: {
        type: this.detectDeviceType(),
        browser: browserInfo.name,
        os: this.getOSInfo(),
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: {
        country: ipInfo.country,
        city: ipInfo.city,
        region: ipInfo.region,
        latitude: ipInfo.latitude,
        longitude: ipInfo.longitude,
        isp: ipInfo.isp,
        vpnDetected: ipInfo.vpnDetected,
        proxyDetected: ipInfo.proxyDetected
      },
      security: {
        fingerprint,
        sslEnabled: location.protocol === 'https:',
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        riskScore: this.calculateRiskScore(ipInfo.vpnDetected, ipInfo.proxyDetected)
      },
      activity: {
        pageViews: 0,
        actionsCount: 0,
        duration: 0,
        lastPage: window.location.pathname,
        isActive: true
      }
    }

    this.sessionTracking.set(session.id, session)
    this.saveSessionToStorage(session)
    
    return session
  }

  // Calculer le score de risque
  private calculateRiskScore(vpnDetected: boolean, proxyDetected: boolean): number {
    let score = 0
    
    if (vpnDetected) score += 30
    if (proxyDetected) score += 40
    if (location.protocol !== 'https:') score += 20
    
    // Ajouter d'autres facteurs de risque
    const userAgent = navigator.userAgent
    if (userAgent.includes('bot') || userAgent.includes('crawler')) score += 50
    
    return Math.min(score, 100)
  }

  // Sauvegarder la session dans localStorage
  private saveSessionToStorage(session: RealTimeSession): void {
    try {
      const sessions = JSON.parse(localStorage.getItem('realTimeSessions') || '[]')
      sessions.push(session)
      
      // Garder seulement les 100 dernières sessions par utilisateur
      const userSessions = sessions.filter((s: RealTimeSession) => s.userId === session.userId)
      const limitedSessions = userSessions.slice(-100)
      
      localStorage.setItem('realTimeSessions', JSON.stringify(limitedSessions))
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  // Mettre à jour l'activité de la session
  updateSessionActivity(sessionId: string, pageView: boolean = false): void {
    const session = this.sessionTracking.get(sessionId)
    if (!session) return

    session.lastActivity = new Date().toISOString()
    session.activity.lastPage = window.location.pathname
    
    if (pageView) {
      session.activity.pageViews++
    } else {
      session.activity.actionsCount++
    }
    
    session.activity.duration = Date.now() - new Date(session.startTime).getTime()
    
    this.sessionTracking.set(sessionId, session)
    this.updateSessionInStorage(session)
  }

  // Mettre à jour la session dans localStorage
  private updateSessionInStorage(updatedSession: RealTimeSession): void {
    try {
      const sessions = JSON.parse(localStorage.getItem('realTimeSessions') || '[]')
      const index = sessions.findIndex((s: RealTimeSession) => s.id === updatedSession.id)
      
      if (index !== -1) {
        sessions[index] = updatedSession
        localStorage.setItem('realTimeSessions', JSON.stringify(sessions))
      }
    } catch (error) {
      console.error('Error updating session:', error)
    }
  }

  // Charger toutes les sessions
  loadAllSessions(): RealTimeSession[] {
    try {
      return JSON.parse(localStorage.getItem('realTimeSessions') || '[]')
    } catch (error) {
      console.error('Error loading sessions:', error)
      return []
    }
  }

  // Démarrer le suivi en temps réel
  startRealTimeTracking(): void {
    if (this.updateInterval) return

    this.updateInterval = setInterval(() => {
      this.sessionTracking.forEach((session, sessionId) => {
        const now = Date.now()
        const lastActivity = new Date(session.lastActivity).getTime()
        const inactiveTime = now - lastActivity
        
        // Marquer comme inactif après 5 minutes
        if (inactiveTime > 5 * 60 * 1000) {
          session.activity.isActive = false
        }
        
        session.activity.duration = now - new Date(session.startTime).getTime()
        this.updateSessionInStorage(session)
      })
    }, 30000) // Toutes les 30 secondes
  }

  // Arrêter le suivi
  stopRealTimeTracking(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  // Obtenir les sessions actives
  getActiveSessions(): RealTimeSession[] {
    return Array.from(this.sessionTracking.values()).filter(session => session.activity.isActive)
  }

  // Nettoyer les anciennes sessions
  cleanupOldSessions(): void {
    const sessions = this.loadAllSessions()
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    
    const activeSessions = sessions.filter((session: RealTimeSession) => {
      return new Date(session.startTime).getTime() > oneWeekAgo
    })
    
    localStorage.setItem('realTimeSessions', JSON.stringify(activeSessions))
  }

  // Créer un compte client simple
  createClientAccount(email: string, fullName: string, phone?: string): UserAccount {
    const account: UserAccount = {
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      fullName,
      phone,
      role: 'client',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      loginCount: 1,
      allSessions: [],
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: new Date().toISOString(),
        failedAttempts: 0,
        accountLocked: false,
        permissions: ['client_dashboard', 'client_requests'],
        trustedDevices: []
      },
      network: {
        ipHistory: [],
        currentIp: 'Unknown',
        isp: 'Unknown',
        vpnDetected: false,
        lastLocation: 'Unknown'
      }
    }

    // Sauvegarder le compte
    const accounts = JSON.parse(localStorage.getItem('userAccounts') || '[]')
    accounts.push(account)
    localStorage.setItem('userAccounts', JSON.stringify(accounts))

    return account
  }

  // Mettre à jour la connexion d'un utilisateur
  updateLogin(userId: string): void {
    try {
      const accounts = JSON.parse(localStorage.getItem('userAccounts') || '[]')
      const accountIndex = accounts.findIndex((acc: UserAccount) => acc.id === userId)
      
      if (accountIndex !== -1) {
        accounts[accountIndex].lastLogin = new Date().toISOString()
        accounts[accountIndex].loginCount++
        localStorage.setItem('userAccounts', JSON.stringify(accounts))
      }
    } catch (error) {
      console.error('Error updating login:', error)
    }
  }

  // Créer un compte (alias pour createClientAccount)
  createAccount(email: string, fullName: string, phone?: string): UserAccount {
    return this.createClientAccount(email, fullName, phone)
  }

  // Enregistrer une connexion (alias pour updateLogin)
  recordLogin(userId: string): void {
    this.updateLogin(userId)
  }

  // Obtenir tous les comptes
  getAllAccounts(): UserAccount[] {
    try {
      return JSON.parse(localStorage.getItem('userAccounts') || '[]')
    } catch (error) {
      console.error('Error loading accounts:', error)
      return []
    }
  }

  // Créer un compte visiteur
  createVisitorAccount(email: string, fullName: string): UserAccount {
    const account: UserAccount = {
      id: `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      fullName,
      role: 'visitor',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      loginCount: 1,
      allSessions: [],
      security: {
        twoFactorEnabled: false,
        lastPasswordChange: new Date().toISOString(),
        failedAttempts: 0,
        accountLocked: false,
        permissions: ['visitor_access'],
        trustedDevices: []
      },
      network: {
        ipHistory: [],
        currentIp: 'Unknown',
        isp: 'Unknown',
        vpnDetected: false,
        lastLocation: 'Unknown'
      }
    }

    // Sauvegarder le compte
    const accounts = this.getAllAccounts()
    accounts.push(account)
    localStorage.setItem('userAccounts', JSON.stringify(accounts))

    return account
  }
}

export default AccountManager
