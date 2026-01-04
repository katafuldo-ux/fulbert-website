import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  MessageSquare, 
  FileText, 
  Calendar,
  Mail,
  Phone,
  Building,
  MapPin,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Reply,
  Send,
  Download,
  Edit,
  Trash2,
  ChevronRight,
  TrendingUp,
  Activity,
  BarChart3,
  User
} from 'lucide-react'

interface Client {
  id: string
  email: string
  fullName: string
  phone: string
  company?: string
  address: string
  city: string
  country: string
  createdAt: string
  lastLogin: string
  status: 'active' | 'inactive'
  requestsCount: number
  totalSpent?: number
}

interface ServiceRequest {
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

export default function ClientManager() {
  const [clients, setClients] = useState<Client[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [activeTab, setActiveTab] = useState<'clients' | 'requests' | 'analytics'>('clients')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [adminResponse, setAdminResponse] = useState('')
  const [showClientDetails, setShowClientDetails] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const clientsData = JSON.parse(localStorage.getItem('clients') || '[]')
    const requestsData = JSON.parse(localStorage.getItem('serviceRequests') || '[]')
    
    // Enrich clients with request counts
    const enrichedClients = clientsData.map((client: Client) => ({
      ...client,
      requestsCount: requestsData.filter((req: ServiceRequest) => req.clientId === client.id).length,
      totalSpent: requestsData
        .filter((req: ServiceRequest) => req.clientId === client.id && req.status === 'completed')
        .reduce((total: number, req: ServiceRequest) => {
          const budget = req.budget ? parseInt(req.budget.replace(/[^0-9]/g, '')) : 0
          return total + budget
        }, 0)
    }))
    
    setClients(enrichedClients)
    setRequests(requestsData)
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const sendAdminResponse = () => {
    if (!adminResponse.trim() || !selectedRequest) return

    const response = {
      id: `MSG-${Date.now()}`,
      requestId: selectedRequest.id,
      message: adminResponse,
      sender: 'admin' as const,
      createdAt: new Date().toISOString(),
      read: false
    }

    const allRequests = JSON.parse(localStorage.getItem('serviceRequests') || '[]')
    const requestIndex = allRequests.findIndex((req: ServiceRequest) => req.id === selectedRequest.id)
    
    if (requestIndex !== -1) {
      allRequests[requestIndex].responses.push(response)
      allRequests[requestIndex].updatedAt = new Date().toISOString()
      localStorage.setItem('serviceRequests', JSON.stringify(allRequests))
      
      setSelectedRequest(allRequests[requestIndex])
      setAdminResponse('')
      loadData()
    }
  }

  const getClientById = (clientId: string) => {
    return clients.find(client => client.id === clientId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service': return '🔧'
      case 'contract': return '📄'
      case 'project': return '💼'
      case 'intervention': return '🚨'
      case 'quote': return '💰'
      case 'invoice': return '🧾'
      default: return '📄'
    }
  }

  const analytics = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    completedRequests: requests.filter(r => r.status === 'completed').length,
    totalRevenue: clients.reduce((sum, client) => sum + (client.totalSpent || 0), 0),
    avgRequestsPerClient: clients.length > 0 ? (requests.length / clients.length).toFixed(1) : '0'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Clients</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {clients.length} clients • {requests.length} demandes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'clients', label: 'Clients', icon: <Users className="w-4 h-4" /> },
              { id: 'requests', label: 'Demandes', icon: <FileText className="w-4 h-4" /> },
              { id: 'analytics', label: 'Statistiques', icon: <BarChart3 className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              {activeTab === 'clients' ? (
                <>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </>
              ) : (
                <>
                  <option value="pending">En attente</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalClients}</p>
                    <p className="text-sm text-green-600">{analytics.activeClients} actifs</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Demandes</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalRequests}</p>
                    <p className="text-sm text-yellow-600">{analytics.pendingRequests} en attente</p>
                  </div>
                  <FileText className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenus</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalRevenue.toLocaleString()} FCFA</p>
                    <p className="text-sm text-green-600">{analytics.completedRequests} complétées</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Moyenne/Client</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.avgRequestsPerClient}</p>
                    <p className="text-sm text-blue-600">demandes</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {requests.slice(0, 10).map(request => {
                  const client = getClientById(request.clientId)
                  return (
                    <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getTypeIcon(request.type)}</span>
                          <div>
                            <p className="font-medium text-gray-900">{request.title}</p>
                            <p className="text-sm text-gray-500">
                              {client?.fullName} • {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedRequest(request)
                              setActiveTab('requests')
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-gray-200">
              {filteredClients.map(client => (
                <div key={client.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{client.fullName}</h3>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                        {client.company && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Building className="w-4 h-4" />
                            <span>{client.company}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{client.city}, {client.country}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {client.requestsCount} demandes
                        </span>
                        {client.totalSpent && client.totalSpent > 0 && (
                          <span className="text-sm font-medium text-green-600">
                            {client.totalSpent.toLocaleString()} FCFA
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          Inscrit le {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedClient(client)
                          setShowClientDetails(true)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const clientRequests = requests.filter(req => req.clientId === client.id)
                          setSelectedClient(client)
                          setActiveTab('requests')
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {selectedRequest ? (
              /* Request Details */
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{selectedRequest.title}</h3>
                      <p className="text-sm text-gray-500">
                        Demande #{selectedRequest.id} • 
                        Client: {getClientById(selectedRequest.clientId)?.fullName}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-gray-700 mb-4">{selectedRequest.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(selectedRequest.urgency)}`}>
                        {selectedRequest.urgency}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {getTypeIcon(selectedRequest.type)} {selectedRequest.type}
                      </span>
                      {selectedRequest.budget && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Budget: {selectedRequest.budget}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Messages</h4>
                    <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                      {selectedRequest.responses.map(response => (
                        <div
                          key={response.id}
                          className={`flex ${response.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              response.sender === 'client'
                                ? 'bg-gray-100 text-gray-900'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            <p>{response.message}</p>
                            <p className={`text-xs mt-1 ${response.sender === 'client' ? 'text-gray-500' : 'text-blue-100'}`}>
                              {response.sender === 'admin' ? 'Admin' : getClientById(selectedRequest.clientId)?.fullName} • 
                              {new Date(response.createdAt).toLocaleString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Admin Response */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Répondre au client..."
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendAdminResponse()}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={sendAdminResponse}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Requests List */
              <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
                {filteredRequests.map(request => {
                  const client = getClientById(request.clientId)
                  return (
                    <div key={request.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg">{getTypeIcon(request.type)}</span>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
                              <p className="text-sm text-gray-500">
                                {client?.fullName} • {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-3">{request.description}</p>
                          <div className="flex items-center space-x-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(request.urgency)}`}>
                              {request.urgency}
                            </span>
                            <span className="text-sm text-gray-500">
                              {request.responses.length} messages
                            </span>
                            {request.responses.some(msg => !msg.read && msg.sender === 'client') && (
                              <span className="text-red-600 font-medium text-sm">Nouveau message</span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setAdminResponse('Bonjour, je suis votre demande. Nous allons la traiter dans les plus brefs délais.')
                              setSelectedRequest(request)
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Client Details Modal */}
      {showClientDetails && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Détails du client</h2>
              <button
                onClick={() => setShowClientDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <p className="text-gray-900">{selectedClient.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedClient.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <p className="text-gray-900">{selectedClient.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                  <p className="text-gray-900">{selectedClient.company || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <p className="text-gray-900">{selectedClient.address}, {selectedClient.city}, {selectedClient.country}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedClient.status)}`}>
                    {selectedClient.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'inscription</label>
                  <p className="text-gray-900">{new Date(selectedClient.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Statistiques</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{selectedClient.requestsCount}</p>
                    <p className="text-sm text-gray-600">Demandes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{selectedClient.totalSpent || 0}</p>
                    <p className="text-sm text-gray-600">FCFA dépensés</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {requests.filter(r => r.clientId === selectedClient.id && r.status === 'in_progress').length}
                    </p>
                    <p className="text-sm text-gray-600">En cours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
