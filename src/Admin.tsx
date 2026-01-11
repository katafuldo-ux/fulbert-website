import { useState, useEffect } from 'react'
import { 
  Users, 
  FileText, 
  Briefcase, 
  Mail, 
  Phone, 
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Menu,
  LogOut,
  Shield,
  Building,
  Lock
} from 'lucide-react'
import GitHubAPI from './utils/githubAPI'

interface Application {
  id: number
  title: string
  body: string
  state: 'open' | 'closed'
  created_at: string
  updated_at: string
  labels: Array<{ name: string }>
  user: { login: string }
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [applications, setApplications] = useState<Application[]>([])
  const [clientRequests, setClientRequests] = useState<Application[]>([])
  const [activeTab, setActiveTab] = useState<'applications' | 'requests' | 'stats'>('applications')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all')
  const [selectedItem, setSelectedItem] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Vérifier si l'admin est déjà authentifié
    const auth = localStorage.getItem('isAdminAuthenticated')
    if (auth === 'true') {
      setIsAuthenticated(true)
      loadData()
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Login simple (email: admin@fulbert.com, password: admin123)
    if (loginForm.email === 'admin@fulbert.com' && loginForm.password === 'admin123') {
      setIsAuthenticated(true)
      localStorage.setItem('isAdminAuthenticated', 'true')
      loadData()
    } else {
      alert('Identifiants incorrects')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('isAdminAuthenticated')
    setApplications([])
    setClientRequests([])
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [apps, requests] = await Promise.all([
        GitHubAPI.getApplications(),
        GitHubAPI.getClientRequests()
      ])
      
      setApplications(apps)
      setClientRequests(requests)
    } catch (err) {
      console.error('Erreur chargement données:', err)
      setError('Impossible de charger les données. Vérifiez votre connexion GitHub.')
    } finally {
      setLoading(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.body.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || app.state === filterStatus
    return matchesSearch && matchesFilter
  })

  const filteredRequests = clientRequests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.body.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || req.state === filterStatus
    return matchesSearch && matchesFilter
  })

  const parseApplicationData = (body: string) => {
    const data: any = {}
    const lines = body.split('\n')
    
    lines.forEach(line => {
      if (line.includes('**Nom Complet**')) {
        data.fullName = line.split('**')[2]?.trim()
      } else if (line.includes('**Email**')) {
        data.email = line.split('**')[2]?.trim()
      } else if (line.includes('**Téléphone**')) {
        data.phone = line.split('**')[2]?.trim()
      } else if (line.includes('**Poste**')) {
        data.position = line.split('**')[2]?.trim()
      } else if (line.includes('**Expérience**')) {
        data.experience = line.split('**')[2]?.trim()
      }
    })
    
    return data
  }

  const getStatusColor = (state: string) => {
    return state === 'open' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
  }

  const getStatusIcon = (state: string) => {
    return state === 'open' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Administration</h2>
            <p className="text-gray-600">FULBERT-ASKY-INGÉNIERIE</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@fulbert.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Se connecter
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Connexion administrateur requise</strong><br />
              Veuillez contacter l'administrateur du site pour obtenir les identifiants.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Administration</h1>
                <p className="text-sm text-gray-500">FULBERT-ASKY-INGÉNIERIE</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Actualiser
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Déconnexion
              </button>
              <a href="#" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800">
                Retour
              </a>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                <p className="text-sm text-gray-600">Candidatures</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{clientRequests.length}</p>
                <p className="text-sm text-gray-600">Demandes clients</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(app => app.state === 'open').length}
                </p>
                <p className="text-sm text-gray-600">Candidatures actives</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {clientRequests.filter(req => req.state === 'open').length}
                </p>
                <p className="text-sm text-gray-600">Demandes en attente</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Candidatures ({applications.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Demandes Clients ({clientRequests.length})
              </button>
            </nav>
          </div>

          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="open">Ouverts</option>
                <option value="closed">Fermés</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'applications' && (
              <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Aucune candidature trouvée
                  </p>
                ) : (
                  filteredApplications.map((app) => {
                    const data = parseApplicationData(app.body)
                    return (
                      <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{app.title}</h3>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-sm text-gray-600">
                                <Mail className="w-3 h-3 inline mr-1" />
                                {data.email}
                              </span>
                              <span className="text-sm text-gray-600">
                                <Phone className="w-3 h-3 inline mr-1" />
                                {data.phone}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(app.state)}`}>
                              {getStatusIcon(app.state)}
                              {app.state === 'open' ? 'Ouvert' : 'Fermé'}
                            </span>
                            <button
                              onClick={() => setSelectedItem(app)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(app.created_at).toLocaleDateString('fr-TG')}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Aucune demande client trouvée
                  </p>
                ) : (
                  filteredRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{request.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {request.labels.map((label, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {label.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(request.state)}`}>
                            {getStatusIcon(request.state)}
                            {request.state === 'open' ? 'Ouvert' : 'Fermé'}
                          </span>
                          <button
                            onClick={() => setSelectedItem(request)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(request.created_at).toLocaleDateString('fr-TG')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">{selectedItem.title}</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded">
                  {selectedItem.body}
                </pre>
              </div>
              <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                <p>Créé le: {new Date(selectedItem.created_at).toLocaleString('fr-TG')}</p>
                <p>Modifié le: {new Date(selectedItem.updated_at).toLocaleString('fr-TG')}</p>
                <p>Statut: {selectedItem.state === 'open' ? 'Ouvert' : 'Fermé'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
