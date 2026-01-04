import { useState, useEffect } from 'react'
import { User, Mail, Phone, FileText, Briefcase, CheckCircle, XCircle, Clock, Eye, Trash2, Download, MessageSquare, Send, Search, Filter, Calendar, Edit, Save, X, Users, TrendingUp, Globe, Monitor } from 'lucide-react'

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

interface VisitorStats {
  totalVisits: number
  uniqueVisitorCount: number
  visitors: Array<{
    timestamp: string
    userAgent: string
    language: string
    platform: string
    screenResolution: string
    referrer: string
    sessionId: string
    visitCount: number
  }>
  lastUpdated: string
}

export default function JobApplicationManager() {
  const [applications, setApplications] = useState<JobApplication[]>([])
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
  const [activeTab, setActiveTab] = useState<'applications' | 'visitors'>('applications')

  useEffect(() => {
    const storedApplications = JSON.parse(localStorage.getItem('jobApplications') || '[]')
    const storedStats = JSON.parse(localStorage.getItem('websiteStats') || '{}')
    
    if (storedStats.totalVisits) {
      setVisitorStats(storedStats)
    }
    
    if (storedApplications.length === 0) {
      const demoApplications = [
        {
          id: 'demo-1',
          fullName: 'Jean Koffi',
          idNumber: 'TG123456789',
          email: 'jean.koffi@email.com',
          phone: '+228 90 12 34 56',
          position: 'Électricien Bâtiment',
          experience: '5-10',
          education: 'BAC+3',
          skills: 'Électricité industrielle, sécurité, maintenance préventive, automatisation',
          motivation: 'Passionné par le domaine électrique avec 5 ans d\'expérience pratique',
          availability: 'Immédiate',
          salary: '250000 - 300000',
          address: 'Rue du Commerce, Lomé',
          city: 'Lomé',
          country: 'Togo',
          status: 'pending' as const,
          submittedAt: '2024-01-15 10:30'
        },
        {
          id: 'demo-2',
          fullName: 'Marie Aho',
          idNumber: 'TG987654321',
          email: 'marie.aho@email.com',
          phone: '+228 91 23 45 67',
          position: 'Technicien Cybersécurité',
          experience: '3-5',
          education: 'BAC+5',
          skills: 'Cybersécurité, administration réseau, audit de sécurité, cryptographie',
          motivation: 'Spécialiste en cybersécurité avec des certifications reconnues',
          availability: '1 mois',
          salary: '300000 - 350000',
          address: 'Avenue de la Paix, Lomé',
          city: 'Lomé',
          country: 'Togo',
          status: 'approved' as const,
          submittedAt: '2024-01-14 14:20',
          reviewedAt: '2024-01-15 09:15',
          notes: 'Excellent profil, expérience pertinente en cybersécurité',
          responseMessage: 'Bonjour Marie, nous sommes ravis de vous informer que votre candidature a été retenue.',
          responseSent: true,
          responseSentAt: '2024-01-15 10:00',
          interviewDate: '2024-01-20 14:00'
        }
      ]
      setApplications(demoApplications)
    } else {
      setApplications(storedApplications)
    }
  }, [])

  const handleStatusChange = (id: string, newStatus: 'approved' | 'rejected' | 'interview', notes?: string) => {
    const updatedApplications = applications.map(app => 
      app.id === id 
        ? { 
            ...app, 
            status: newStatus, 
            reviewedAt: new Date().toLocaleString('fr-TG'),
            notes: notes || app.notes
          } 
        : app
    )
    setApplications(updatedApplications)
    localStorage.setItem('jobApplications', JSON.stringify(updatedApplications))
  }

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      const updatedApplications = applications.filter(app => app.id !== id)
      setApplications(updatedApplications)
      localStorage.setItem('jobApplications', JSON.stringify(updatedApplications))
      if (selectedApplication?.id === id) {
        setSelectedApplication(null)
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
    link.href = URL.createObjectURL(blob)
    link.download = `candidatures_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
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
    <div className="min-h-screen bg-gray-50 p-6">
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

          {/* Onglets */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Briefcase className="w-4 h-4 inline mr-2" />
              Candidatures ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('visitors')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'visitors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Statistiques Visiteurs
            </button>
          </div>
        </div>

        {activeTab === 'applications' ? (
          <>
            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="approved">Approuvés</option>
                  <option value="rejected">Rejetés</option>
                  <option value="interview">Entretien</option>
                </select>

                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Toutes les positions</option>
                  <option value="Électricien Bâtiment">Électricien Bâtiment</option>
                  <option value="Électricien Industriel">Électricien Industriel</option>
                  <option value="Technicien Cybersécurité">Technicien Cybersécurité</option>
                  <option value="Ingénieur Électrique">Ingénieur Électrique</option>
                  <option value="Ingénieur Cybersécurité">Ingénieur Cybersécurité</option>
                </select>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Liste des candidatures */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Candidatures ({filteredApplications.length})</h2>
                  </div>
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {filteredApplications.map(application => (
                      <div
                        key={application.id}
                        className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedApplication?.id === application.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedApplication(application)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{application.fullName}</h3>
                            <p className="text-sm text-gray-600">{application.position}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            {application.status === 'pending' && 'En attente'}
                            {application.status === 'approved' && 'Approuvé'}
                            {application.status === 'rejected' && 'Rejeté'}
                            {application.status === 'interview' && 'Entretien'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {application.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {application.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            {application.experience} ans
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {application.submittedAt}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(application.id, 'approved')
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(application.id, 'interview')
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Entretien
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(application.id, 'rejected')
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            Rejeter
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(application.id)
                            }}
                            className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Détails de la candidature */}
              <div className="lg:col-span-1">
                {selectedApplication ? (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Détails</h2>
                      <button
                        onClick={() => setSelectedApplication(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Informations personnelles</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nom:</span>
                            <span className="font-medium">{selectedApplication.fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">CNI:</span>
                            <span className="font-medium">{selectedApplication.idNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{selectedApplication.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Téléphone:</span>
                            <span className="font-medium">{selectedApplication.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Adresse:</span>
                            <span className="font-medium">{selectedApplication.address}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ville:</span>
                            <span className="font-medium">{selectedApplication.city}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pays:</span>
                            <span className="font-medium">{selectedApplication.country}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Professionnel</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Position:</span>
                            <span className="font-medium">{selectedApplication.position}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Expérience:</span>
                            <span className="font-medium">{selectedApplication.experience} ans</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Éducation:</span>
                            <span className="font-medium">{selectedApplication.education}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Salaire:</span>
                            <span className="font-medium">{selectedApplication.salary} FCFA</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Disponibilité:</span>
                            <span className="font-medium">{selectedApplication.availability}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Compétences</h3>
                        <p className="text-sm text-gray-600">{selectedApplication.skills}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Motivation</h3>
                        <p className="text-sm text-gray-600">{selectedApplication.motivation}</p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-gray-900">Notes</h3>
                          <button
                            onClick={() => {
                              setEditingNotes(true)
                              setTempNotes(selectedApplication.notes || '')
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                        {editingNotes ? (
                          <div className="space-y-2">
                            <textarea
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveNotes}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingNotes(false)}
                                className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            {selectedApplication.notes || 'Aucune note'}
                          </p>
                        )}
                      </div>

                      <div>
                        <button
                          onClick={() => setShowResponseForm(true)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Envoyer une réponse
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Sélectionnez une candidature pour voir les détails</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Statistiques des visiteurs */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Statistiques des Visiteurs</h2>
                
                {visitorStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">{visitorStats.totalVisits}</p>
                      <p className="text-sm text-gray-600">Visites totales</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{visitorStats.uniqueVisitorCount}</p>
                      <p className="text-sm text-gray-600">Visiteurs uniques</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-600">
                        {visitorStats.totalVisits > 0 ? Math.round((visitorStats.uniqueVisitorCount / visitorStats.totalVisits) * 100) : 0}%
                      </p>
                      <p className="text-sm text-gray-600">Taux de retour</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg text-center">
                      <Monitor className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-600">
                        {visitorStats.visitors.length > 0 ? new Set(visitorStats.visitors.map(v => v.screenResolution)).size : 0}
                      </p>
                      <p className="text-sm text-gray-600">Résolutions d'écran</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune donnée de visiteur disponible</p>
                  </div>
                )}

                {visitorStats && visitorStats.visitors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Visiteurs récents</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-4">Date</th>
                            <th className="text-left py-2 px-4">Session</th>
                            <th className="text-left py-2 px-4">Navigateur</th>
                            <th className="text-left py-2 px-4">Plateforme</th>
                            <th className="text-left py-2 px-4">Écran</th>
                            <th className="text-left py-2 px-4">Visites</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visitorStats.visitors.slice(0, 10).map((visitor, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-2 px-4">
                                {new Date(visitor.timestamp).toLocaleString('fr-TG')}
                              </td>
                              <td className="py-2 px-4">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {visitor.sessionId.substring(0, 8)}...
                                </span>
                              </td>
                              <td className="py-2 px-4">
                                {visitor.userAgent.includes('Chrome') ? 'Chrome' :
                                 visitor.userAgent.includes('Firefox') ? 'Firefox' :
                                 visitor.userAgent.includes('Safari') ? 'Safari' : 'Autre'}
                              </td>
                              <td className="py-2 px-4">{visitor.platform}</td>
                              <td className="py-2 px-4">{visitor.screenResolution}</td>
                              <td className="py-2 px-4">{visitor.visitCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par plateforme</h3>
                {visitorStats && visitorStats.visitors.length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(
                      visitorStats.visitors.reduce((acc, visitor) => {
                        const platform = visitor.platform || 'Unknown'
                        acc[platform] = (acc[platform] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                    ).map(([platform, count]) => (
                      <div key={platform} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{platform}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(count / visitorStats.visitors.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucune donnée disponible</p>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Langues</h3>
                {visitorStats && visitorStats.visitors.length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(
                      visitorStats.visitors.reduce((acc, visitor) => {
                        const lang = visitor.language || 'Unknown'
                        acc[lang] = (acc[lang] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                    ).map(([lang, count]) => (
                      <div key={lang} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{lang}</span>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucune donnée disponible</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de réponse */}
        {showResponseForm && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Réponse à {selectedApplication.fullName}</h3>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Rédigez votre réponse..."
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowResponseForm(false)
                    setResponseMessage('')
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendResponse}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
