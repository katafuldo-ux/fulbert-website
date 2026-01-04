import { useState, useEffect } from 'react'
import JobApplicationManager from './components/JobApplicationManager'
import ClientManager from './components/ClientManager'
import Login from './components/Login'

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState<'applications' | 'clients'>('applications')

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié
    const auth = localStorage.getItem('isAdminAuthenticated')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (success: boolean) => {
    setIsAuthenticated(success)
  }

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">Administration - ASKYAKAZZA</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('applications')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'applications'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Candidatures
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'clients'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Clients
              </button>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </div>
      {activeTab === 'applications' ? <JobApplicationManager /> : <ClientManager />}
    </div>
  )
}

export default Admin
