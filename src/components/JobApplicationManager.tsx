import { useState, useEffect } from 'react'
import { User, Mail, Phone, FileText, Briefcase, CheckCircle, XCircle, Clock, Eye, Trash2, Download, MessageSquare, Send, Search, Filter, Calendar, Edit, Save, X, Users, TrendingUp, Globe, Monitor, Database, Shield, Activity } from 'lucide-react'
import { decryptData, encryptData } from '../utils/security'
import BasePanel from './BasePanel'
import SimpleApi from '../utils/simpleApi'

interface JobApplication {
  id: string
  fullName: string
  idNumber: string
  email: string
  phone: string
  position: string
  experience: string
  education: string
  skills: string
  motivation: string
  availability: string
  salary: string
  address: string
  city: string
  country: string
  status: 'pending' | 'approved' | 'rejected' | 'interview'
  submittedAt: string
  reviewedAt?: string
  notes?: string
  responseMessage?: string
  responseSent?: boolean
  responseSentAt?: string
  interviewDate?: string
}

interface UserAccount {
  id: string
  email: string
  fullName: string
  phone?: string
  company?: string
  role: 'admin' | 'client' | 'visitor'
  createdAt: string
  lastLogin: string
  isActive: boolean
  loginCount: number
  userAgent?: string
  ip?: string
}

interface VisitorStats {
  totalVisitors: number
  activeUsers: number
  todayVisitors: number
  countries: number
  recentVisitors: Array<{
    timestamp: string
    sessionId: string
    ip: string
    userAgent: string
    browser: string
    platform: string
    screenResolution: string
    country: string
  }>
  pageViews: Array<{
    page: string
    title: string
    views: number
    duration: string
  }>
}

export default function JobApplicationManager() {
  const [activePanel, setActivePanel] = useState<'applications' | 'accounts' | 'clients' | 'base'>('applications')
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([])
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'interview'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [responseMessage, setResponseMessage] = useState('')
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [tempNotes, setTempNotes] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [positionFilter, setPositionFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null)

  useEffect(() => {
    loadData()
    
    // Écouter les changements en temps réel
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jobApplications') {
        loadApplications()
      }
      if (e.key === 'userAccounts') {
        loadUserAccounts()
      }
      if (e.key === 'websiteStats') {
        loadVisitorStats()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Vérifier périodiquement les nouvelles données
    const interval = setInterval(() => {
      loadData()
    }, 5000) // Toutes les 5 secondes
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const loadData = () => {
    loadApplications()
    loadUserAccounts()
    loadVisitorStats()
  }

  const loadApplications = async () => {
    try {
      // Utiliser l'API simplifiée
      const applications = await SimpleApi.getJobApplications();
      
      // Filtrer les données de démo
      const filteredApplications = applications.filter((app: any) => 
        !app.id.includes('demo') && 
        !app.email.includes('demo') && 
        !app.fullName.includes('Demo')
      );
      
      setApplications(filteredApplications);
      
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures:', error);
      setApplications([]);
    }
  }

  const loadUserAccounts = async () => {
    try {
      // Utiliser l'API simplifiée
      const accounts = await SimpleApi.getClients();
      const filteredAccounts = accounts.filter((account: any) => 
        !account.id.includes('demo') && 
        !account.email.includes('demo') && 
        !account.fullName.includes('Demo')
      );
      setUserAccounts(filteredAccounts);
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error);
      setUserAccounts([]);
    }
  }

  const loadVisitorStats = async () => {
    try {
      // Utiliser l'API simplifiée
      const stats = await SimpleApi.getClients();
      setVisitorStats(stats as any);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // Données de démo si aucune donnée réelle
      setVisitorStats({
        totalVisitors: 1247,
        activeUsers: 89,
        todayVisitors: 156,
        countries: 12,
        recentVisitors: [
          {
            timestamp: new Date().toISOString(),
            sessionId: 'sess_' + Math.random().toString(36).substr(2, 9),
            ip: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            browser: 'Chrome',
            platform: 'Windows',
            screenResolution: '1920x1080',
            country: 'Togo'
          }
        ],
        pageViews: [
          {
            page: '/',
            title: 'Accueil',
            views: 45,
            duration: '2:30'
          }
        ]
      });
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    const updatedApplications = applications.map(app => 
      app.id === id 
        ? { ...app, status: newStatus as any, reviewedAt: new Date().toISOString() }
        : app
    )
    setApplications(updatedApplications)
    
    // Sauvegarder via l'API simplifiée
    try {
      await SimpleApi.updateJobApplication(id, { 
        status: newStatus, 
        reviewedAt: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      const updatedApplications = applications.filter(app => app.id !== id)
      setApplications(updatedApplications)
      
      // Supprimer via l'API simplifiée
      try {
        await SimpleApi.deleteJobApplication(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  }

  const handleSendResponse = () => {
    if (!selectedApplication || !responseMessage.trim()) return

    const updatedApplications = applications.map(app => 
      app.id === selectedApplication.id 
        ? { 
            ...app, 
            responseMessage,
            responseSent: true,
            responseSentAt: new Date().toLocaleString('fr-TG')
          } 
        : app
    )
    setApplications(updatedApplications)
    localStorage.setItem('jobApplications', JSON.stringify(updatedApplications))
    localStorage.setItem('jobApplications_debug', JSON.stringify(updatedApplications))
    setShowResponseForm(false)
    setResponseMessage('')
    alert('Réponse envoyée avec succès !')
  }

  const handleSaveNotes = () => {
    if (!selectedApplication) return

    const updatedApplications = applications.map(app => 
      app.id === selectedApplication.id 
        ? { ...app, notes: tempNotes } 
        : app
    )
    setApplications(updatedApplications)
    localStorage.setItem('jobApplications', JSON.stringify(updatedApplications))
    localStorage.setItem('jobApplications_debug', JSON.stringify(updatedApplications))
    setSelectedApplication({ ...selectedApplication, notes: tempNotes })
    setEditingNotes(false)
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Position', 'Expérience', 'Éducation', 'Statut', 'Date de soumission']
    const csvContent = [
      headers.join(','),
      ...applications.map(app => [
        app.id,
        app.fullName,
        app.email,
        app.phone,
        app.position,
        app.experience,
        app.education,
        app.status,
        app.submittedAt
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const href = URL.createObjectURL(blob)
    link.href = href
    link.download = `candidatures_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(href)
  }

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPosition = !positionFilter || app.position === positionFilter
    const matchesDate = !dateFilter || app.submittedAt.includes(dateFilter)
    
    return matchesFilter && matchesSearch && matchesPosition && matchesDate
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'interview': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'interview': return <Calendar className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {activePanel === 'base' ? (
        <BasePanel />
      ) : (
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Panneau d'Administration FULBERT-ASKY</h1>
                  <p className="text-gray-600">Gérez les candidatures et consultez les statistiques du site</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={exportToCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exporter CSV
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex space-x-1 mb-6">
                <button
                  onClick={() => setActivePanel('applications')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activePanel === 'applications'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Candidatures
                </button>
                <button
                  onClick={() => setActivePanel('accounts')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activePanel === 'accounts'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Comptes
                </button>
                <button
                  onClick={() => setActivePanel('clients')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activePanel === 'clients'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Clients
                </button>
                <button
                  onClick={() => setActivePanel('base')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activePanel === 'base'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  BASE
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
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
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvées</option>
                  <option value="rejected">Rejetées</option>
                  <option value="interview">Entretien</option>
                </select>
              </div>
            </div>

            {activePanel === 'applications' && (
              <>
                {/* Applications list */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidat</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredApplications.map((application) => (
                          <tr key={application.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{application.fullName}</div>
                                <div className="text-sm text-gray-500">{application.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{application.position}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                                {getStatusIcon(application.status)}
                                <span className="ml-1">{application.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.submittedAt}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => setSelectedApplication(application)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(application.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activePanel === 'accounts' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Gestion des comptes</h2>
                <p className="text-gray-600">Cette section est en développement.</p>
              </div>
            )}

            {activePanel === 'clients' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Gestion des clients</h2>
                <p className="text-gray-600">Cette section est en développement.</p>
              </div>
            )}

            {/* Application Details Modal */}
            {selectedApplication && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-900">Détails de la candidature</h2>
                      <button
                        onClick={() => setSelectedApplication(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                        <div className="space-y-3">
                          <div><strong>Nom:</strong> {selectedApplication.fullName}</div>
                          <div><strong>Email:</strong> {selectedApplication.email}</div>
                          <div><strong>Téléphone:</strong> {selectedApplication.phone}</div>
                          <div><strong>CNI:</strong> {selectedApplication.idNumber}</div>
                          <div><strong>Adresse:</strong> {selectedApplication.address}, {selectedApplication.city}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professionnel</h3>
                        <div className="space-y-3">
                          <div><strong>Position:</strong> {selectedApplication.position}</div>
                          <div><strong>Expérience:</strong> {selectedApplication.experience}</div>
                          <div><strong>Éducation:</strong> {selectedApplication.education}</div>
                          <div><strong>Compétences:</strong> {selectedApplication.skills}</div>
                          <div><strong>Salaire:</strong> {selectedApplication.salary}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Motivation</h3>
                      <p className="text-gray-700">{selectedApplication.motivation}</p>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Disponibilité</h3>
                      <p className="text-gray-700">{selectedApplication.availability}</p>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => handleStatusChange(selectedApplication.id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Rejeter
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedApplication.id, 'interview')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Entretien
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
