import { useState, useEffect } from 'react'
import { Users, Briefcase, Mail, Phone, Search, Filter, Eye, Edit, Trash2, Calendar, MapPin, Building, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import ApiService from '../utils/apiService'
import dataPersistence from '../utils/dataPersistence'

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
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [showClientDetails, setShowClientDetails] = useState(false)
  const [showRequestDetails, setShowRequestDetails] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [clientsData, requestsData] = await Promise.all([
        dataPersistence.getClients(),
        dataPersistence.getServiceRequests()
      ])
      setClients(clientsData)
      setServiceRequests(requestsData)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filter === 'all' || client.status === filter
    return matchesSearch && matchesFilter
  })

  const getClientRequests = (clientId: string) => {
    return serviceRequests.filter(request => request.clientId === clientId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleClientStatusChange = async (clientId: string, newStatus: 'active' | 'inactive') => {
    try {
      await dataPersistence.updateClient(clientId, { status: newStatus })
      const updatedClients = clients.map(client =>
        client.id === clientId ? { ...client, status: newStatus } : client
      )
      setClients(updatedClients)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await ApiService.deleteClient(clientId)
        const updatedClients = clients.filter(client => client.id !== clientId)
        setClients(updatedClients)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Entreprise', 'Ville', 'Pays', 'Statut', 'Date de création']
    const csvContent = [
      headers.join(','),
      ...clients.map(client => [
        client.id,
        client.fullName,
        client.email,
        client.phone,
        client.company || '',
        client.city,
        client.country,
        client.status,
        client.createdAt
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const href = URL.createObjectURL(blob)
    link.href = href
    link.download = `clients_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(href)
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Clients</h1>
              <p className="text-gray-600">Consultez et gérez tous les clients et leurs demandes</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Exporter CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="inactive">Inactifs</option>
            </select>
            <div className="text-sm text-gray-600 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              {filteredClients.length} client(s) trouvé(s)
            </div>
          </div>
        </div>

        {/* Clients List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localisation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demandes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => {
                  const clientRequests = getClientRequests(client.id)
                  return (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{client.fullName}</div>
                          {client.company && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <Building className="w-3 h-3 mr-1" />
                              {client.company}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {client.email}
                          </div>
                          <div className="flex items-center mt-1">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {client.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {client.city}, {client.country}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                          {client.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                          {clientRequests.length} demande(s)
                        </div>
                        <div className="text-xs text-gray-500">
                          {clientRequests.filter(r => r.status === 'pending').length} en attente
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedClient(client)
                            setShowClientDetails(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleClientStatusChange(client.id, client.status === 'active' ? 'inactive' : 'active')}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Client Details Modal */}
        {selectedClient && showClientDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Détails du Client</h2>
                  <button
                    onClick={() => setShowClientDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                    <div className="space-y-3">
                      <div><strong>Nom:</strong> {selectedClient.fullName}</div>
                      <div><strong>Email:</strong> {selectedClient.email}</div>
                      <div><strong>Téléphone:</strong> {selectedClient.phone}</div>
                      {selectedClient.company && <div><strong>Entreprise:</strong> {selectedClient.company}</div>}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h3>
                    <div className="space-y-3">
                      <div><strong>Adresse:</strong> {selectedClient.address}</div>
                      <div><strong>Ville:</strong> {selectedClient.city}</div>
                      <div><strong>Pays:</strong> {selectedClient.country}</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Demandes du client</h3>
                  {getClientRequests(selectedClient.id).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Aucune demande pour ce client.</p>
                  ) : (
                    <div className="space-y-3">
                      {getClientRequests(selectedClient.id).map((request) => (
                        <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{request.title}</h4>
                              <p className="text-sm text-gray-600">{request.type}</p>
                            </div>
                            <div className="flex gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(request.urgency)}`}>
                                {request.urgency}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                          <p className="text-xs text-gray-500">
                            Créée le: {new Date(request.createdAt).toLocaleDateString('fr-TG')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
