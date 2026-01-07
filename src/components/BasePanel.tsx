import { useState, useEffect } from 'react'
import { 
  Database, 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Shield, 
  Activity, 
  Globe, 
  Fingerprint, 
  UserCheck, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Download, 
  Upload, 
  RefreshCw, 
  Settings, 
  Lock, 
  Unlock, 
  Trash2, 
  Edit,
  Monitor,
  Smartphone,
  Tablet,
  ChevronRight,
  TrendingUp,
  BarChart3,
  PieChart,
  UserX,
  UserPlus,
  Wifi,
  WifiOff,
  X
} from 'lucide-react'
import AccountManager from '../utils/accountManager'

// Interfaces locales pour BasePanel
interface RealTimeSession {
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

interface UserAccount {
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

export default function BasePanel() {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'client' | 'visitor'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended' | 'banned'>('all')
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sessions' | 'security' | 'analytics'>('overview')
  const [realTimeMode, setRealTimeMode] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const accountManager = AccountManager.getInstance()

  useEffect(() => {
    loadUsers()
    startRealTimeTracking()
    
    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      loadUsers()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      accountManager.stopRealTimeTracking()
    }
  }, [])

  const loadUsers = async () => {
    try {
      // Charger les comptes utilisateurs
      const userAccounts = JSON.parse(localStorage.getItem('userAccounts') || '[]')
      const clients = JSON.parse(localStorage.getItem('clients') || '[]')
      
      // Combiner et transformer les données
      const allUsers: UserAccount[] = []
      
      // Ajouter les comptes utilisateurs
      userAccounts.forEach((account: any) => {
        const userSessions = accountManager.loadAllSessions().filter(s => s.userId === account.id)
        
        allUsers.push({
          id: account.id,
          email: account.email,
          fullName: account.fullName,
          phone: account.phone,
          company: account.company,
          role: account.role,
          status: account.status || 'active',
          createdAt: account.createdAt || new Date().toISOString(),
          lastLogin: account.lastLogin || new Date().toISOString(),
          loginCount: account.loginCount || 0,
          currentSession: userSessions.find(s => s.activity.isActive),
          allSessions: userSessions,
          security: {
            twoFactorEnabled: account.twoFactorEnabled || false,
            lastPasswordChange: account.lastPasswordChange || new Date().toISOString(),
            failedAttempts: account.failedAttempts || 0,
            accountLocked: account.accountLocked || false,
            permissions: account.permissions || [],
            trustedDevices: account.trustedDevices || []
          },
          network: {
            ipHistory: account.ipHistory || [],
            currentIp: account.currentIp || 'Unknown',
            isp: account.isp || 'Unknown',
            vpnDetected: account.vpnDetected || false,
            lastLocation: account.lastLocation || 'Unknown'
          }
        })
      })
      
      // Ajouter les clients
      clients.forEach((client: any) => {
        const userSessions = accountManager.loadAllSessions().filter(s => s.userId === client.id)
        
        allUsers.push({
          id: client.id,
          email: client.email,
          fullName: client.fullName,
          phone: client.phone,
          company: client.company,
          role: 'client',
          status: client.status || 'active',
          createdAt: client.createdAt || new Date().toISOString(),
          lastLogin: client.lastLogin || new Date().toISOString(),
          loginCount: client.loginCount || 0,
          currentSession: userSessions.find(s => s.activity.isActive),
          allSessions: userSessions,
          security: {
            twoFactorEnabled: client.twoFactorEnabled || false,
            lastPasswordChange: client.lastPasswordChange || new Date().toISOString(),
            failedAttempts: client.failedAttempts || 0,
            accountLocked: client.accountLocked || false,
            permissions: client.permissions || ['client_access'],
            trustedDevices: client.trustedDevices || []
          },
          network: {
            ipHistory: client.ipHistory || [],
            currentIp: client.currentIp || 'Unknown',
            isp: client.isp || 'Unknown',
            vpnDetected: client.vpnDetected || false,
            lastLocation: client.lastLocation || 'Unknown'
          }
        })
      })
      
      setUsers(allUsers)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    }
  }

  const startRealTimeTracking = () => {
    accountManager.startRealTimeTracking()
    
    // Mettre à jour les données toutes les 5 secondes en mode temps réel
    if (realTimeMode) {
      const interval = setInterval(() => {
        loadUsers()
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleUserAction = async (userId: string, action: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'activate':
            return { ...user, status: 'active' as const }
          case 'deactivate':
            return { ...user, status: 'inactive' as const }
          case 'suspend':
            return { ...user, status: 'suspended' as const }
          case 'ban':
            return { ...user, status: 'banned' as const }
          case 'unlock':
            return { 
              ...user, 
              status: 'active' as const,
              security: { ...user.security, accountLocked: false, failedAttempts: 0 }
            }
          default:
            return user
        }
      }
      return user
    })
    
    setUsers(updatedUsers)
    
    // Sauvegarder dans localStorage
    const userAccounts = JSON.parse(localStorage.getItem('userAccounts') || '[]')
    const updatedAccounts = userAccounts.map((account: any) => {
      const user = updatedUsers.find(u => u.id === account.id)
      if (user) {
        return {
          ...account,
          status: user.status,
          accountLocked: user.security.accountLocked,
          failedAttempts: user.security.failedAttempts
        }
      }
      return account
    })
    
    localStorage.setItem('userAccounts', JSON.stringify(updatedAccounts))
  }

  const exportUserData = () => {
    const exportData = filteredUsers.map(user => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      currentIp: user.currentSession?.currentIp || user.network.currentIp,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount,
      device: user.currentSession?.deviceInfo.type || 'Unknown',
      location: user.currentSession?.location.city || user.network.lastLocation,
      vpnDetected: user.currentSession?.location.vpnDetected || user.network.vpnDetected,
      riskScore: user.currentSession?.security.riskScore || 0
    }))
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `base_users_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop': return <Monitor className="w-4 h-4" />
      case 'mobile': return <Smartphone className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-yellow-100 text-yellow-800'
      case 'banned': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600'
    if (score < 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const activeUsersCount = users.filter(u => u.status === 'active').length
  const currentSessionsCount = users.filter(u => u.currentSession?.activity.isActive).length
  const vpnUsersCount = users.filter(u => u.currentSession?.location.vpnDetected || u.network.vpnDetected).length
  const highRiskUsersCount = users.filter(u => (u.currentSession?.security.riskScore || 0) > 60).length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">BASE - Système de Contrôle</h1>
                <p className="text-gray-600">Surveillance et gestion complète des utilisateurs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${realTimeMode ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">
                  {realTimeMode ? 'Temps réel' : 'Manuel'}
                </span>
              </div>
              <button
                onClick={() => setRealTimeMode(!realTimeMode)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {realTimeMode ? 'Pause' : 'Reprendre'}
              </button>
              <button
                onClick={exportUserData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Users className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{activeUsersCount}</span>
              </div>
              <p className="text-sm text-gray-700 mt-2">Utilisateurs actifs</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Activity className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{currentSessionsCount}</span>
              </div>
              <p className="text-sm text-gray-700 mt-2">Sessions actives</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <WifiOff className="w-8 h-8 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-600">{vpnUsersCount}</span>
              </div>
              <p className="text-sm text-gray-700 mt-2">Utilisateurs VPN</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <span className="text-2xl font-bold text-red-600">{highRiskUsersCount}</span>
              </div>
              <p className="text-sm text-gray-700 mt-2">Risque élevé</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6">
            {[
              { id: 'overview', label: 'Aperçu', icon: BarChart3 },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'sessions', label: 'Sessions', icon: Activity },
              { id: 'security', label: 'Sécurité', icon: Shield },
              { id: 'analytics', label: 'Analytiques', icon: PieChart }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Admin</option>
              <option value="client">Client</option>
              <option value="visitor">Visiteur</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="suspended">Suspendu</option>
              <option value="banned">Banni</option>
            </select>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Actuelle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appareil</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localisation</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.company && <div className="text-xs text-gray-400">{user.company}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'client' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {user.currentSession?.currentIp || user.network.currentIp}
                        </div>
                        {user.currentSession?.location.vpnDetected && (
                          <div className="flex items-center gap-1 text-xs text-yellow-600">
                            <WifiOff className="w-3 h-3" />
                            VPN
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(user.currentSession?.deviceInfo.type || 'desktop')}
                          <div>
                            <div className="text-sm text-gray-900">{user.currentSession?.deviceInfo.browser || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{user.currentSession?.deviceInfo.os || 'Unknown'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.currentSession?.location.city || user.network.lastLocation}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.currentSession?.location.country || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleUserAction(user.id, 'deactivate')}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserAction(user.id, 'activate')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Détails Utilisateur</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Info personnelles */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nom:</span>
                        <span className="font-medium">{selectedUser.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone:</span>
                        <span className="font-medium">{selectedUser.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Entreprise:</span>
                        <span className="font-medium">{selectedUser.company || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rôle:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          selectedUser.role === 'client' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedUser.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Session actuelle */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Session actuelle</h3>
                    {selectedUser.currentSession ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">IP:</span>
                          <span className="font-mono text-sm">{selectedUser.currentSession.currentIp}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Appareil:</span>
                          <span className="font-medium">{selectedUser.currentSession.deviceInfo.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Navigateur:</span>
                          <span className="font-medium">{selectedUser.currentSession.deviceInfo.browser}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">OS:</span>
                          <span className="font-medium">{selectedUser.currentSession.deviceInfo.os}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Localisation:</span>
                          <span className="font-medium">{selectedUser.currentSession.location.city}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">VPN:</span>
                          <span className={selectedUser.currentSession.location.vpnDetected ? 'text-red-600' : 'text-green-600'}>
                            {selectedUser.currentSession.location.vpnDetected ? 'Oui' : 'Non'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Score risque:</span>
                          <span className={`font-medium ${getRiskColor(selectedUser.currentSession.security.riskScore)}`}>
                            {selectedUser.currentSession.security.riskScore}/100
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Aucune session active</p>
                    )}
                  </div>

                  {/* Sécurité */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">2FA:</span>
                        <span className={selectedUser.security.twoFactorEnabled ? 'text-green-600' : 'text-red-600'}>
                          {selectedUser.security.twoFactorEnabled ? 'Activé' : 'Désactivé'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Compte verrouillé:</span>
                        <span className={selectedUser.security.accountLocked ? 'text-red-600' : 'text-green-600'}>
                          {selectedUser.security.accountLocked ? 'Oui' : 'Non'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tentatives échouées:</span>
                        <span className="font-medium">{selectedUser.security.failedAttempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dernier changement:</span>
                        <span className="font-medium text-sm">
                          {new Date(selectedUser.security.lastPasswordChange).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedUser.status === 'active' ? (
                      <button
                        onClick={() => handleUserAction(selectedUser.id, 'suspend')}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Suspendre
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUserAction(selectedUser.id, 'activate')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Activer
                      </button>
                    )}
                    <button
                      onClick={() => handleUserAction(selectedUser.id, 'ban')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Bannir
                    </button>
                    {selectedUser.security.accountLocked && (
                      <button
                        onClick={() => handleUserAction(selectedUser.id, 'unlock')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Déverrouiller
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-TG')}
        </div>
      </div>
    </div>
  )
}
