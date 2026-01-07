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
  ChevronRight,
  Lock,
  Unlock,
  Building,
  MapPin
} from 'lucide-react'
import { sanitizeInput, validateEmail, validatePhone } from '../utils/security'
import GitHubAPI from '../utils/githubAPI'

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

export default function ClientSpace() {
  const [currentUser, setCurrentUser] = useState<Client | null>(null)
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(true)
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    country: 'Togo',
    password: '',
    confirmPassword: ''
  })
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'responses' | 'profile'>('dashboard')
  const [newRequestForm, setNewRequestForm] = useState({
    type: 'service' as const,
    title: '',
    description: '',
    urgency: 'medium' as const,
    budget: '',
    deadline: ''
  })
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = () => {
    const sessionData = localStorage.getItem('clientSession')
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData)
        if (session.expiresAt > Date.now()) {
          setCurrentUser(session.client)
          loadClientRequests(session.client.id)
        } else {
          localStorage.removeItem('clientSession')
        }
      } catch (error) {
        localStorage.removeItem('clientSession')
      }
    }
  }

  const loadClientRequests = async (clientId: string) => {
    try {
      // Utiliser l'API GitHub pour charger les demandes du client
      const allRequests = await GitHubAPI.getClientRequests();
      // Filtrer par clientId dans le corps de l'issue
      const clientRequests = allRequests.filter((req: any) => 
        req.body.includes(`ID Client**: ${clientId}`)
      );
      setRequests(clientRequests);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      setRequests([]);
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingAccount(true)

    // Validation
    if (!validateEmail(formData.email)) {
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 3000)
      setIsCreatingAccount(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 3000)
      setIsCreatingAccount(false)
      return
    }

    if (formData.password.length < 6) {
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 3000)
      setIsCreatingAccount(false)
      return
    }

    try {
      // Générer un ID client unique
      const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const clientData: Client = {
        id: clientId,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        company: formData.company,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        status: 'active' as const
      }

      // Créer la session client simple
      const sessionData = {
        client: clientData,
        loginTime: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
      }
      localStorage.setItem('clientSession', JSON.stringify(sessionData))

      setCurrentUser(clientData)
      setShowLoginForm(false)
      setSubmitStatus('success')
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        city: '',
        country: 'Togo',
        password: '',
        confirmPassword: ''
      })

      setTimeout(() => {
        setSubmitStatus('idle')
      }, 3000)
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error)
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 3000)
    } finally {
      setIsCreatingAccount(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)

    try {
      // Simulation simple de login (sans base de données)
      if (loginForm.email && loginForm.password) {
        const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const clientData: Client = {
          id: clientId,
          email: loginForm.email,
          fullName: 'Client',
          phone: '+228 XX XX XX XX',
          address: 'À compléter',
          city: 'Lomé',
          country: 'Togo',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          status: 'active'
        }
        
        // Créer la session
        const sessionData = {
          client: clientData,
          loginTime: Date.now(),
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 heures
        }
        localStorage.setItem('clientSession', JSON.stringify(sessionData))

        setCurrentUser(clientData)
        setShowLoginForm(false)
        loadClientRequests(clientData.id)
        setSubmitStatus('success')
        
        setLoginForm({ email: '', password: '' })
        setTimeout(() => {
          setSubmitStatus('idle')
        }, 3000)
      } else {
        setSubmitStatus('error')
        setTimeout(() => setSubmitStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error)
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 3000)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('clientSession')
    setCurrentUser(null)
    setShowLoginForm(true)
    setActiveTab('dashboard')
  }

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) return

    try {
      // Envoyer les données à GitHub via l'API
      await GitHubAPI.createClientRequestIssue({
        clientId: currentUser.id,
        type: newRequestForm.type,
        title: newRequestForm.title,
        description: newRequestForm.description,
        urgency: newRequestForm.urgency,
        budget: newRequestForm.budget,
        deadline: newRequestForm.deadline,
        clientName: currentUser.fullName,
        clientEmail: currentUser.email,
        clientPhone: currentUser.phone
      })
      
      setNewRequestForm({
        type: 'service',
        title: '',
        description: '',
        urgency: 'medium',
        budget: '',
        deadline: ''
      });
      setActiveTab('requests');
      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      
      // Recharger les demandes
      loadClientRequests(currentUser.id);
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  }

  if (showLoginForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Espace Client</h1>
              <p className="text-gray-600">FULBERT-ASKY-INGÉNIERIE</p>
            </div>

            {submitStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                Opération réussie !
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                Erreur. Veuillez vérifier vos informations.
              </div>
            )}

            <div className="flex mb-6">
              <button
                onClick={() => setActiveForm('login')}
                className={`flex-1 py-2 text-center font-medium ${
                  activeForm === 'login'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 border-b-2 border-transparent'
                }`}
              >
                Connexion
              </button>
              <button
                onClick={() => setActiveForm('register')}
                className={`flex-1 py-2 text-center font-medium ${
                  activeForm === 'register'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 border-b-2 border-transparent'
                }`}
              >
                Créer un compte
              </button>
            </div>

            {activeForm === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email professionnel
                  </label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@entreprise.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isLoggingIn ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@entreprise.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+228 XX XX XX XX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nom de votre entreprise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Min 6 caractères"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le mot de passe *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirmer le mot de passe"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingAccount}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isCreatingAccount ? 'Création...' : 'Créer mon compte'}
                </button>
              </form>
            )}

            <div className="mt-6 text-center">
              <a href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                ← Retour à l'accueil
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Espace Client</h1>
              <p className="text-gray-600">Bienvenue, {currentUser?.fullName || 'Client'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              Se déconnecter
            </button>
          </div>

          <div className="flex space-x-1 mb-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'requests'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Mes demandes
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'responses'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Réponses
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'profile'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Mon profil
            </button>
          </div>

          {activeTab === 'dashboard' && (
            <div>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">{requests.length}</span>
                  </div>
                  <p className="text-gray-700">Demandes totales</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {requests.filter(r => r.status === 'completed').length}
                    </span>
                  </div>
                  <p className="text-gray-700">Demandes terminées</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 text-yellow-600" />
                    <span className="text-2xl font-bold text-yellow-600">
                      {requests.filter(r => r.status === 'pending').length}
                    </span>
                  </div>
                  <p className="text-gray-700">En attente</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Créer une nouvelle demande</h2>
                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                    Demande créée avec succès !
                  </div>
                )}
                <form onSubmit={handleCreateRequest} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de demande
                      </label>
                      <select
                        value={newRequestForm.type}
                        onChange={(e) => setNewRequestForm({...newRequestForm, type: e.target.value as any})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgence
                      </label>
                      <select
                        value={newRequestForm.urgency}
                        onChange={(e) => setNewRequestForm({...newRequestForm, urgency: e.target.value as any})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Faible</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Élevée</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de la demande
                    </label>
                    <input
                      type="text"
                      value={newRequestForm.title}
                      onChange={(e) => setNewRequestForm({...newRequestForm, title: e.target.value})}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Titre de votre demande"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newRequestForm.description}
                      onChange={(e) => setNewRequestForm({...newRequestForm, description: e.target.value})}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Décrivez votre demande en détail..."
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget (optionnel)
                      </label>
                      <input
                        type="text"
                        value={newRequestForm.budget}
                        onChange={(e) => setNewRequestForm({...newRequestForm, budget: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: 500000 FCFA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Délai (optionnel)
                      </label>
                      <input
                        type="date"
                        value={newRequestForm.deadline}
                        onChange={(e) => setNewRequestForm({...newRequestForm, deadline: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Créer la demande
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Mes demandes</h2>
              {requests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Vous n'avez pas encore de demande.
                </p>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.title}</h3>
                          <p className="text-sm text-gray-600">{request.type}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status === 'pending' ? 'En attente' :
                           request.status === 'in_progress' ? 'En cours' :
                           request.status === 'completed' ? 'Terminé' : 'Annulé'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                      <p className="text-sm text-gray-600">
                        Créée le: {new Date(request.createdAt).toLocaleDateString('fr-TG')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'responses' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Réponses de l'administration</h2>
              <div className="space-y-4">
                {requests.filter(req => req.responses && req.responses.length > 0).map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{request.title}</h3>
                        <p className="text-sm text-gray-600">{request.type}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status === 'pending' ? 'En attente' :
                         request.status === 'in_progress' ? 'En cours' :
                         request.status === 'completed' ? 'Terminé' : 'Annulé'}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                      <p className="text-xs text-gray-500">
                        Demandé le: {new Date(request.createdAt).toLocaleDateString('fr-TG')}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900">Réponses de l'administration:</h4>
                      {request.responses.map((response) => (
                        <div key={response.id} className={`rounded-lg p-3 ${
                          response.sender === 'admin' 
                            ? 'bg-blue-50 border-l-4 border-blue-500' 
                            : 'bg-gray-100 border-l-4 border-gray-400'
                        }`}>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-xs font-medium ${
                              response.sender === 'admin' ? 'text-blue-700' : 'text-gray-600'
                            }`}>
                              {response.sender === 'admin' ? 'Administration' : 'Vous'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(response.createdAt).toLocaleString('fr-TG')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{response.message}</p>
                          {response.sender === 'admin' && !response.read && (
                            <div className="mt-2">
                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Nouveau
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                        Répondre
                      </button>
                      <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors">
                        Marquer comme lu
                      </button>
                    </div>
                  </div>
                ))}
                
                {requests.filter(req => req.responses && req.responses.length > 0).length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune réponse de l'administration pour le moment.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Les réponses apparaîtront ici dès que l'administration répondra à vos demandes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Mon profil</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <p className="text-gray-900">{currentUser?.fullName || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <p className="text-gray-900">{currentUser?.email || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <p className="text-gray-900">{currentUser?.phone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entreprise
                    </label>
                    <p className="text-gray-900">{currentUser?.company || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <p className="text-gray-900">{currentUser?.address || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <p className="text-gray-900">{currentUser?.city || 'Non renseigné'}</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Compte créé le: {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('fr-TG') : 'Non renseigné'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Dernière connexion: {currentUser?.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString('fr-TG') : 'Non renseigné'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
