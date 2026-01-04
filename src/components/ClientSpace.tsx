import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  MessageSquare,
  Calendar,
  DollarSign,
  Receipt,
  Briefcase,
  Wrench,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  ChevronRight
} from 'lucide-react'
import DataPersistence from '../utils/dataPersistence'
import type { Client as ClientData, ServiceRequest as ServiceRequestData } from '../utils/dataPersistence'

interface Client {
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
  responses: ServiceResponse[]
  documents?: Document[]
}

interface ServiceResponse {
  id: string
  message: string
  sender: 'client' | 'admin'
  createdAt: string
  read: boolean
  requestId?: string // Optionnel pour compatibilité
}

interface Document {
  id: string
  name: string
  type: 'quote' | 'invoice' | 'contract' | 'report'
  url: string
  createdAt: string
  status: 'draft' | 'sent' | 'signed' | 'paid'
}

export default function ClientSpace() {
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'messages' | 'documents' | 'profile'>('dashboard')
  const [newMessage, setNewMessage] = useState('')
  const [showNewRequestForm, setShowNewRequestForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    // Initialiser la migration des données et charger le client
    DataPersistence.migrateOldData()
    
    const clientData = DataPersistence.getCurrentClient()
    if (clientData) {
      setCurrentClient(clientData)
      loadClientRequests(clientData.id)
    }
  }, [])

  const loadClientRequests = (clientId: string) => {
    const clientRequests = DataPersistence.getServiceRequestsByClientId(clientId)
    // Convertir ServiceRequestData en ServiceRequest pour compatibilité
    const convertedRequests = clientRequests.map(req => ({
      ...req,
      responses: req.responses.map(resp => ({
        id: resp.id,
        message: resp.message,
        sender: resp.sender,
        createdAt: resp.createdAt,
        read: resp.read,
        requestId: resp.requestId || req.id // Ajouter requestId manquant
      }))
    }))
    setRequests(convertedRequests)
  }

  const createNewRequest = (requestData: Partial<ServiceRequest>) => {
    if (!currentClient) return

    const newRequest: ServiceRequest = {
      id: `REQ-${Date.now()}`,
      clientId: currentClient.id,
      type: requestData.type || 'service',
      title: requestData.title || '',
      description: requestData.description || '',
      urgency: requestData.urgency || 'medium',
      status: 'pending',
      budget: requestData.budget,
      deadline: requestData.deadline,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
      documents: []
    }

    DataPersistence.addServiceRequest(newRequest)
    loadClientRequests(currentClient.id)
    setShowNewRequestForm(false)
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !currentClient) return

    let request = selectedRequest
    
    // Si aucune demande n'est sélectionnée, créer une nouvelle demande de type "message"
    if (!request) {
      const newRequest: ServiceRequest = {
        id: `REQ-${Date.now()}`,
        clientId: currentClient.id,
        type: 'service',
        title: 'Message du client',
        description: 'Conversation initiée par le client',
        urgency: 'medium',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: []
      }

      DataPersistence.addServiceRequest(newRequest)
      request = newRequest
      setSelectedRequest(newRequest)
      loadClientRequests(currentClient.id)
    }

    const response: ServiceResponse = {
      id: `MSG-${Date.now()}`,
      requestId: request.id,
      message: newMessage,
      sender: 'client',
      createdAt: new Date().toISOString(),
      read: false
    }

    const allRequests = DataPersistence.getServiceRequests()
    const requestIndex = allRequests.findIndex((req: ServiceRequestData) => req.id === request.id)
    
    if (requestIndex !== -1) {
      allRequests[requestIndex].responses.push(response)
      allRequests[requestIndex].updatedAt = new Date().toISOString()
      DataPersistence.saveServiceRequests(allRequests)
      
      const updatedRequest = allRequests[requestIndex]
      setSelectedRequest(updatedRequest)
      loadClientRequests(currentClient.id)
      setNewMessage('')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service': return <Wrench className="w-4 h-4" />
      case 'contract': return <FileText className="w-4 h-4" />
      case 'project': return <Briefcase className="w-4 h-4" />
      case 'intervention': return <AlertCircle className="w-4 h-4" />
      case 'quote': return <DollarSign className="w-4 h-4" />
      case 'invoice': return <Receipt className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
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

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (!currentClient) {
    return <ClientLogin onLogin={(client) => setCurrentClient(client)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Espace Client</h1>
                <p className="text-sm text-gray-500">{currentClient.fullName}</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('currentClient')
                setCurrentClient(null)
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: <Settings className="w-4 h-4" /> },
              { id: 'requests', label: 'Mes demandes', icon: <FileText className="w-4 h-4" /> },
              { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'documents', label: 'Documents', icon: <Receipt className="w-4 h-4" /> },
              { id: 'profile', label: 'Profil', icon: <User className="w-4 h-4" /> }
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total demandes</p>
                    <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En cours</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {requests.filter(r => r.status === 'in_progress').length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Terminées</p>
                    <p className="text-2xl font-bold text-green-600">
                      {requests.filter(r => r.status === 'completed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Messages non lus</p>
                    <p className="text-2xl font-bold text-red-600">
                      {requests.reduce((acc, r) => acc + r.responses.filter(msg => !msg.read && msg.sender === 'admin').length, 0)}
                    </p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Demandes récentes</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {requests.slice(0, 5).map(request => (
                  <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(request.type)}
                        <div>
                          <p className="font-medium text-gray-900">{request.title}</p>
                          <p className="text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Mes demandes de service</h2>
              <button
                onClick={() => setShowNewRequestForm(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle demande</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher une demande..."
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
                <option value="pending">En attente</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            {/* Requests List */}
            <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
              {filteredRequests.map(request => (
                <div key={request.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getTypeIcon(request.type)}
                        <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-3">{request.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency}
                        </span>
                        {request.budget && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Budget: {request.budget}
                          </span>
                        )}
                        {request.deadline && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Deadline: {new Date(request.deadline).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Créée le {new Date(request.createdAt).toLocaleDateString('fr-FR')}</span>
                        <span>•</span>
                        <span>{request.responses.length} messages</span>
                        {request.responses.some(msg => !msg.read && msg.sender === 'admin') && (
                          <span className="text-red-600 font-medium">Nouveaux messages</span>
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            {!selectedRequest ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                  <button
                    onClick={() => {
                      // Créer une nouvelle conversation
                      const newRequest: ServiceRequest = {
                        id: `REQ-${Date.now()}`,
                        clientId: currentClient.id,
                        type: 'service',
                        title: 'Nouvelle conversation',
                        description: 'Conversation initiée par le client',
                        urgency: 'medium',
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        responses: []
                      }
                      
                      const allRequests = JSON.parse(localStorage.getItem('serviceRequests') || '[]')
                      allRequests.push(newRequest)
                      localStorage.setItem('serviceRequests', JSON.stringify(allRequests))
                      
                      setSelectedRequest(newRequest)
                      loadClientRequests(currentClient.id)
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Nouvelle conversation
                  </button>
                </div>
                <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
                  {requests.filter(request => request.responses.length > 0).map(request => (
                    <div key={request.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getTypeIcon(request.type)}
                            <h3 className="text-lg font-medium text-gray-900">{request.title}</h3>
                          </div>
                          <p className="text-gray-600 mb-3">{request.description}</p>
                          <div className="flex items-center space-x-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                            <span className="text-sm text-gray-500">
                              {request.responses.length} messages
                            </span>
                            {request.responses.some(msg => !msg.read && msg.sender === 'admin') && (
                              <span className="text-red-600 font-medium">Nouveaux messages</span>
                            )}
                            <span className="text-sm text-gray-500">
                              Dernier message: {new Date(Math.max(...request.responses.map(r => new Date(r.createdAt).getTime()))).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {requests.filter(request => request.responses.length > 0).length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                      <p className="mb-4">Aucune conversation pour le moment</p>
                      <button
                        onClick={() => {
                          const newRequest: ServiceRequest = {
                            id: `REQ-${Date.now()}`,
                            clientId: currentClient.id,
                            type: 'service',
                            title: 'Première conversation',
                            description: 'Conversation initiée par le client',
                            urgency: 'medium',
                            status: 'pending',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            responses: []
                          }
                          
                          const allRequests = JSON.parse(localStorage.getItem('serviceRequests') || '[]')
                          allRequests.push(newRequest)
                          localStorage.setItem('serviceRequests', JSON.stringify(allRequests))
                          
                          setSelectedRequest(newRequest)
                          loadClientRequests(currentClient.id)
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Commencer une conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <div className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{selectedRequest.title}</h3>
                      <p className="text-sm text-gray-500">Demande #{selectedRequest.id}</p>
                    </div>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="h-96 overflow-y-auto p-6 space-y-4">
                  {selectedRequest.responses.map(response => (
                    <div
                      key={response.id}
                      className={`flex ${response.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          response.sender === 'client'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{response.message}</p>
                        <p className={`text-xs mt-1 ${response.sender === 'client' ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(response.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {selectedRequest.responses.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <p>Aucun message dans cette conversation</p>
                      <p className="text-sm">Envoyez votre premier message ci-dessous</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Mes documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { type: 'quote', title: 'Devis', count: 0, icon: <DollarSign className="w-6 h-6" /> },
                { type: 'invoice', title: 'Factures', count: 0, icon: <Receipt className="w-6 h-6" /> },
                { type: 'contract', title: 'Contrats', count: 0, icon: <FileText className="w-6 h-6" /> }
              ].map(docType => (
                <div key={docType.type} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                      {docType.icon}
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{docType.count}</span>
                  </div>
                  <h3 className="font-medium text-gray-900">{docType.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">Aucun document pour le moment</p>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-2">📋 Gestion des documents</h3>
              <p className="text-blue-700 mb-4">
                Les documents (devis, factures, contrats) seront ajoutés par l'administrateur 
                et apparaîtront ici dès qu'ils seront disponibles.
              </p>
              <div className="space-y-2 text-sm text-blue-600">
                <p>• Les devis sont créés lors de vos demandes de service</p>
                <p>• Les factures sont générées après validation des prestations</p>
                <p>• Les contrats sont établis pour les services récurrents</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Informations du profil</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                    <p className="text-gray-900">{currentClient.fullName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{currentClient.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <p className="text-gray-900">{currentClient.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                    <p className="text-gray-900">{currentClient.company || 'Non spécifié'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <p className="text-gray-900">{currentClient.address}, {currentClient.city}, {currentClient.country}</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-200">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Modifier les informations
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showNewRequestForm && (
        <NewRequestForm
          onClose={() => setShowNewRequestForm(false)}
          onSubmit={createNewRequest}
        />
      )}
    </div>
  )
}

// Client Login Component
function ClientLogin({ onLogin }: { onLogin: (client: Client) => void }) {
  const [email, setEmail] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    domicile: '',
    company: '',
    address: '',
    city: '',
    country: 'Togo'
  })
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Vérifier que l'email se termine par @Ful-Asky.com
    if (!email.endsWith('@Ful-Asky.com')) {
      setError('Seuls les emails @Ful-Asky.com sont autorisés.')
      return
    }
    
    let client = DataPersistence.getClientByEmail(email)
    
    if (!client) {
      // Créer automatiquement le client s'il n'existe pas
      client = {
        id: `CLI-${Date.now()}`,
        email,
        fullName: email.split('@')[0], // Utiliser la partie avant @ comme nom
        phone: '',
        company: '',
        address: '',
        city: '',
        country: 'Togo',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: 'active'
      }
      
      DataPersistence.addClient(client)
    }
    
    DataPersistence.setCurrentClient(client)
    onLogin(client)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Vérifier que l'email se termine par @Ful-Asky.com
    if (!email.endsWith('@Ful-Asky.com')) {
      setError('Seuls les emails @Ful-Asky.com sont autorisés.')
      return
    }
    
    const existingClient = DataPersistence.getClientByEmail(email)
    
    if (existingClient) {
      setError('Un compte avec cet email existe déjà.')
      return
    }

    const newClient: Client = {
      id: `CLI-${Date.now()}`,
      email,
      fullName: formData.fullName,
      phone: formData.phone,
      company: formData.company,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: 'active'
    }

    DataPersistence.addClient(newClient)
    DataPersistence.setCurrentClient(newClient)
    onLogin(newClient)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isRegistering ? 'Créer un compte' : 'Espace Client'}
          </h1>
          <p className="text-gray-600">
            {isRegistering ? 'Rejoignez notre espace client' : 'Accédez à votre espace client'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email @Ful-Asky.com</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votrenom@Ful-Asky.com"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Uniquement les adresses @Ful-Asky.com sont acceptées
            </p>
          </div>

          {!isRegistering ? (
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Accéder à l'espace client
            </button>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre nom complet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+228 XX XX XX XX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro domicile</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={formData.domicile}
                    onChange={(e) => setFormData({...formData, domicile: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="XX XX XX XX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise (optionnel)</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom de votre entreprise"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre adresse complète"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Votre ville"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer mon compte
              </button>
            </>
          )}
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            {isRegistering ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? Créer un compte'}
          </button>
        </div>
      </div>
    </div>
  )
}

// New Request Form Component
function NewRequestForm({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    type: 'service' as const,
    title: '',
    description: '',
    urgency: 'medium' as const,
    budget: '',
    deadline: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nouvelle demande de service</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de demande</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as any})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="service">Service</option>
              <option value="contract">Contrat</option>
              <option value="project">Projet</option>
              <option value="intervention">Intervention</option>
              <option value="quote">Devis</option>
              <option value="invoice">Facture</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Titre de votre demande"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Décrivez votre demande en détail..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Urgence</label>
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({...formData, urgency: e.target.value as any})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget (optionnel)</label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 500000 FCFA"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date limite (optionnel)</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Envoyer la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
