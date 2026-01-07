import { useState, useEffect } from 'react'
import { Users, FileText, Briefcase, CheckCircle, XCircle, Clock, Eye, Trash2, Download, Search, Filter } from 'lucide-react'

interface JobApplication {
  id: string
  fullName: string
  email: string
  phone: string
  position: string
  status: 'pending' | 'approved' | 'rejected' | 'interview'
  submittedAt: string
}

export default function FallbackAdmin() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'interview'>('all')

  useEffect(() => {
    // Charger depuis localStorage directement
    const loadApplications = () => {
      try {
        const stored = localStorage.getItem('jobApplications')
        const debug = localStorage.getItem('jobApplications_debug')
        
        let apps: JobApplication[] = []
        
        if (debug) {
          apps = JSON.parse(debug)
        } else if (stored) {
          apps = JSON.parse(stored)
        }
        
        // Filtrer les données de démo
        const filtered = apps.filter(app => 
          !app.id.includes('demo') && 
          !app.email.includes('demo') && 
          !app.fullName.includes('Demo')
        )
        
        setApplications(filtered)
      } catch (error) {
        console.error('Erreur:', error)
        setApplications([])
      }
    }

    loadApplications()
    
    // Écouter les changements
    const handleStorageChange = () => {
      loadApplications()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [])

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter
    const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.position.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
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
      case 'interview': return <Clock className="w-4 h-4" />
      default: return null
    }
  }

  const handleStatusChange = (id: string, newStatus: string) => {
    const updated = applications.map(app => 
      app.id === id ? { ...app, status: newStatus as any } : app
    )
    setApplications(updated)
    localStorage.setItem('jobApplications', JSON.stringify(updated))
    localStorage.setItem('jobApplications_debug', JSON.stringify(updated))
  }

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      const updated = applications.filter(app => app.id !== id)
      setApplications(updated)
      localStorage.setItem('jobApplications', JSON.stringify(updated))
      localStorage.setItem('jobApplications_debug', JSON.stringify(updated))
    }
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Position', 'Statut', 'Date']
    const csvContent = [
      headers.join(','),
      ...applications.map(app => [
        app.id,
        app.fullName,
        app.email,
        app.phone,
        app.position,
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

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Panneau d'Administration (Mode Secours)</h1>
              <p className="text-gray-600">Gérez les candidatures avec localStorage direct</p>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            <div className="text-sm text-gray-600 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              {filteredApplications.length} candidature(s)
            </div>
          </div>
        </div>

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
                        onClick={() => alert(`Détails de ${application.fullName}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(application.id, 'approved')}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XCircle className="w-4 h-4" />
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
      </div>
    </div>
  )
}
