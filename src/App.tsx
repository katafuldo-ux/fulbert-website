import { useState, useEffect } from 'react'
import { Phone, Mail, Zap, Shield, Wrench, Building, Factory, Lock, Globe, CheckCircle, Power, Settings, Cpu, Database, User, Send, Clock, FileText, Briefcase, Users, Award, AlertTriangle, Wifi, Server, Cloud } from 'lucide-react'
import Logo from './components/Logo'
import MigrationHelper from './components/MigrationHelper'
import DebugPanel from './components/DebugPanel'
import { sanitizeInput, validateEmail, validatePhone, validateIdNumber } from './utils/security'
import GitHubAPI from './utils/githubAPI'

function App() {
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    education: '',
    skills: '',
    motivation: '',
    availability: '',
    salary: '',
    address: '',
    city: '',
    country: 'Togo'
  })
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle')

  // Système de suivi des visiteurs simple (sans localStorage)
  useEffect(() => {
    const trackVisitor = () => {
      try {
        console.log('Visiteur tracking - données non stockées localement')
        // Optionnel: envoyer des statistiques à Google Analytics ou autre service
      } catch (error) {
        console.debug('Tracking info:', error)
      }
    }

    trackVisitor()
  }, [])

  const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    // Nettoyer et valider les entrées
    const cleanValue = sanitizeInput(value)
    setFormData({
      ...formData,
      [name]: cleanValue
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation des données avant soumission
    if (!validateEmail(formData.email)) {
      alert('Email invalide')
      return
    }
    
    if (!validatePhone(formData.phone)) {
      alert('Numéro de téléphone invalide')
      return
    }
    
    if (!validateIdNumber(formData.idNumber)) {
      alert('Numéro CNI invalide')
      return
    }

    try {
      setSubmitStatus('loading')
      
      // Envoyer les données à GitHub via l'API
      console.log('Envoi de la candidature...', formData)
      const result = await GitHubAPI.createApplicationIssue(formData)
      console.log('Succès:', result)
      
      // Afficher un message de succès
      alert('Candidature envoyée avec succès ! Vous recevrez une confirmation par email.')
      
      // Réinitialiser le formulaire
      setFormData({
        fullName: '',
        idNumber: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        education: '',
        skills: '',
        motivation: '',
        availability: '',
        salary: '',
        address: '',
        city: '',
        country: 'Togo'
      })
      
      setSubmitStatus('success')
      setTimeout(() => setSubmitStatus('idle'), 3000)
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la candidature:', error)
      alert('Erreur lors de l\'envoi. Veuillez réessayer plus tard.')
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <MigrationHelper />
      <DebugPanel />
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo size="large" />
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#accueil" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Accueil</a>
              <a href="#electricite" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Électricité</a>
              <a href="#cybersecurite" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Cybersécurité</a>
              <a href="#recrutement" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Recrutement</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Contact</a>
              <a href="#client" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg">Espace Client</a>
              <a href="#admin" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg">Admin</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="accueil" className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                <span className="bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">FULBERT-ASKY-INGÉNIERIE</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-6 font-medium">
                Excellence en ingénierie électrique, électronique et cybersécurité
              </p>
              <p className="text-base text-gray-500 mb-6">
                Solutions expertes pour le bâtiment, l'industrie et les systèmes informatiques
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#electricite" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Expertise Électrique
                </a>
                <a href="#cybersecurite" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors">
                  Cybersécurité
                </a>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/fulbert-website/images/ingenieur-optim.jpg"
                alt="Ingénieur électricien travaillant sur tableau de commande industriel"
                className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                style={{ maxHeight: '400px' }}
                onError={(e) => { e.currentTarget.src = '/fulbert-website/images/888.jpeg'; }}
              />
              <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white p-3 rounded-xl shadow-lg">
                <Zap className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Électricité Section */}
      <section id="electricite" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Expertise Électrique</h2>
            <p className="text-lg text-gray-600">
              Solutions complètes pour le bâtiment et l'industrie avec les meilleurs outils
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <Building className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Électricité du Bâtiment</h3>
              </div>
              <img 
                src="/fulbert-website/images/cablage-electrique-dans-construction_406939-16306.avif"
                alt="Électricien professionnel câblage électrique dans bâtiment"
                className="w-full h-48 object-cover rounded-lg mb-6 shadow-md"
                style={{ objectPosition: 'center' }}
                onError={(e) => { e.currentTarget.src = '/fulbert-website/images/888.jpeg'; }}
              />
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Nos Outils Spécialisés :</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <Power className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Testeurs</span>
                  </div>
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <Settings className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Multimètres</span>
                  </div>
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Pinces ampèremétriques</span>
                  </div>
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <Wrench className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Outillage professionnel</span>
                  </div>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Installation et mise aux normes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Maintenance et dépannage</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Rénovation électrique complète</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Éclairage et domotique</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Tableaux électriques et sécurité</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <Factory className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Électricité Industrielle</h3>
              </div>
              <img 
                src="/fulbert-website/images/888.jpeg"
                alt="Tableau électrique industriel avec automates programmables"
                className="w-full h-48 object-cover rounded-lg mb-6 shadow-md"
                style={{ objectPosition: 'center' }}
              />
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Équipements Industriels :</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <Cpu className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Automates</span>
                  </div>
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <Power className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Variateurs</span>
                  </div>
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <Settings className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Armoires de commande</span>
                  </div>
                  <div className="flex items-center bg-gray-50 p-3 rounded-lg">
                    <Database className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Systèmes de contrôle</span>
                  </div>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Équipements industriels</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Automatisation et contrôle</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Machines et outillage électrique</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Armoires électriques industrielles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-700">Maintenance préventive et curative</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cybersécurité Section */}
      <section id="cybersecurite" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-3">
              <Shield className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Cybersécurité</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Protection complète de vos systèmes informatiques et données
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <Lock className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurité des Systèmes</h3>
              <img 
                src="/fulbert-website/images/77.jpeg"
                alt="Serveur de cybersécurité avec protection des données"
                className="w-full h-32 object-cover rounded-lg mb-4 shadow-md"
                style={{ objectPosition: 'center' }}
              />
              <ul className="space-y-2 text-gray-600">
                <li>• Audit de sécurité</li>
                <li>• Configuration sécurisée</li>
                <li>• Mise à jour des systèmes</li>
                <li>• Surveillance continue</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <Globe className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurité Réseau</h3>
              <img 
                src="/fulbert-website/images/equipe-ingenieurs-optim.jpg"
                alt="Ingénieur cybersécurité travaillant sur infrastructure réseau"
                className="w-full h-32 object-cover rounded-lg mb-4 shadow-md"
                style={{ objectPosition: 'center' }}
                onError={(e) => { e.currentTarget.src = '/fulbert-website/images/77.jpeg'; }}
              />
              <ul className="space-y-2 text-gray-600">
                <li>• Pare-feu et filtrage</li>
                <li>• VPN sécurisé</li>
                <li>• Détection d'intrusion</li>
                <li>• Segmentation réseau</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow">
              <Shield className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Protection des Données</h3>
              <img 
                src="/fulbert-website/images/equipe-noire-optim.jpg"
                alt="Analyse de cybersécurité et protection des données"
                className="w-full h-32 object-cover rounded-lg mb-4 shadow-md"
                style={{ objectPosition: 'center' }}
                onError={(e) => { e.currentTarget.src = '/fulbert-website/images/88.jpeg'; }}
              />
              <ul className="space-y-2 text-gray-600">
                <li>• Chiffrement des données</li>
                <li>• Sauvegarde sécurisée</li>
                <li>• Plan de reprise d'activité</li>
                <li>• Sensibilisation des équipes</li>
              </ul>
            </div>
          </div>

          {/* Services Additionnels Cybersécurité */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-6">Nos Services Spécialisés</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-500 transition-colors">
                <Wifi className="w-8 h-8 text-green-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Audit Wi-Fi</h4>
                <p className="text-sm text-gray-600">Analyse complète de vos réseaux sans fil</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-500 transition-colors">
                <Server className="w-8 h-8 text-green-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Sécurité Serveur</h4>
                <p className="text-sm text-gray-600">Protection de vos infrastructures critiques</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-500 transition-colors">
                <Cloud className="w-8 h-8 text-green-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Cloud Sécurisé</h4>
                <p className="text-sm text-gray-600">Migration et protection cloud</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-green-500 transition-colors">
                <AlertTriangle className="w-8 h-8 text-green-600 mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Réponse Incident</h4>
                <p className="text-sm text-gray-600">Intervention rapide en cas d'attaque</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recrutement Section */}
      <section id="recrutement" className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Rejoignez Notre Équipe</h2>
            <p className="text-lg text-gray-600">
              FULBERT-ASKY-INGÉNIERIE recrute les meilleurs talents
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-6">
                <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Pourquoi nous rejoindre ?</h3>
              </div>
              <img 
                src="/fulbert-website/images/image3.jpg"
                alt="Équipe d'ingénieurs électriciens sur chantier technique"
                className="w-full h-48 object-cover rounded-lg mb-6 shadow-md"
                style={{ objectPosition: 'center' }}
              />
              <div className="space-y-4">
                <div className="flex items-start">
                  <Award className="w-6 h-6 text-yellow-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Excellence</h4>
                    <p className="text-gray-600">Travaillez avec des experts reconnus</p>
                  </div>
                </div>
                <div className="mt-6 text-center">
              <a href="#" className="text-blue-600 hover:text-blue-700 text-sm">
                ← Retour à l'accueil
              </a>
            </div>
                <div className="flex items-start">
                  <Shield className="w-6 h-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Équipe Dynamique</h4>
                    <p className="text-gray-600">Ambiance collaborative et stimulante</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="w-6 h-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Sécurité</h4>
                    <p className="text-gray-600">Formation continue et équipements de qualité</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-6">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Formulaire de Candidature</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Nom Complet *
                    </label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Votre nom complet"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Numéro CNI *
                    </label>
                    <input 
                      type="text" 
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Numéro de carte d'identité"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Professionnel *
                    </label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="votre.email@exemple.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Téléphone *
                    </label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="+228 XX XX XX XX"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="w-4 h-4 inline mr-1" />
                      Position Recherchée *
                    </label>
                    <select 
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Sélectionnez une position</option>
                      <option value="Électricien Bâtiment">Électricien Bâtiment</option>
                      <option value="Électricien Industriel">Électricien Industriel</option>
                      <option value="Technicien Cybersécurité">Technicien Cybersécurité</option>
                      <option value="Ingénieur Électrique">Ingénieur Électrique</option>
                      <option value="Ingénieur Cybersécurité">Ingénieur Cybersécurité</option>
                      <option value="Ingénieur Électronique">Ingénieur Électronique</option>
                      <option value="Analyste Sécurité">Analyste Sécurité</option>
                      <option value="Technicien Réseau">Technicien Réseau</option>
                      <option value="Stagiaire">Stagiaire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Award className="w-4 h-4 inline mr-1" />
                      Années d'expérience *
                    </label>
                    <select 
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="0-1">0-1 an</option>
                      <option value="1-3">1-3 ans</option>
                      <option value="3-5">3-5 ans</option>
                      <option value="5-10">5-10 ans</option>
                      <option value="10+">10+ ans</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Database className="w-4 h-4 inline mr-1" />
                      Niveau d'études *
                    </label>
                    <select 
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="BAC">BAC</option>
                      <option value="BAC+1">BAC+1</option>
                      <option value="BAC+2">BAC+2</option>
                      <option value="BAC+3">BAC+3 (Licence)</option>
                      <option value="BAC+4">BAC+4 (Master 1)</option>
                      <option value="BAC+5">BAC+5 (Master 2)</option>
                      <option value="Doctorat">Doctorat</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Settings className="w-4 h-4 inline mr-1" />
                    Compétences Techniques *
                  </label>
                  <textarea 
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Décrivez vos compétences techniques (ex: électricité industrielle, cybersécurité, programmation, réseaux...)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Award className="w-4 h-4 inline mr-1" />
                    Motivation *
                  </label>
                  <textarea 
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Pourquoi voulez-vous nous rejoindre ?"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Disponibilité *
                    </label>
                    <select 
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="Immédiate">Immédiate</option>
                      <option value="1 mois">1 mois</option>
                      <option value="2 mois">2 mois</option>
                      <option value="3 mois">3 mois</option>
                      <option value="Plus de 3 mois">Plus de 3 mois</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Briefcase className="w-4 h-4 inline mr-1" />
                      Prétentions salariales (FCFA/mois)
                    </label>
                    <input 
                      type="text" 
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Ex: 150000 - 200000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Adresse complète *
                  </label>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Votre adresse complète"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="w-4 h-4 inline mr-1" />
                      Ville *
                    </label>
                    <input 
                      type="text" 
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Votre ville"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Pays *
                    </label>
                    <input 
                      type="text" 
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Votre pays"
                    />
                  </div>
                </div>

                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span>Votre candidature a été soumise avec succès ! Nous vous contacterons dans les 72h.</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Envoyer la Demande
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center text-blue-700">
                  <Clock className="w-5 h-5 mr-2" />
                  <p className="text-sm">
                    <strong>Délai de réponse : 72h maximum</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Contactez nos Experts</h2>
            <p className="text-lg text-gray-600">
              Des solutions sur mesure pour vos projets électriques et de cybersécurité
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-600">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-4">Appel d'Urgence</h3>
              <img 
                src="/images/4.jpeg"
                alt="Technicien électricien en intervention d'urgence"
                className="w-full h-32 object-cover rounded-lg mb-4 shadow-md"
                style={{ objectPosition: 'center' }}
              />
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-blue-600">+228 70 87 22 84</p>
                <p className="text-lg text-gray-600">+228 71 20 14 19</p>
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm inline-block">
                  Disponible 24/7
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-600">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-4">Consultation Gratuite</h3>
              <img 
                src="/images/images.jpeg"
                alt="Ingénieur consultant en bureau technique"
                className="w-full h-32 object-cover rounded-lg mb-4 shadow-md"
                style={{ objectPosition: 'center' }}
              />
              <div className="text-center space-y-2">
                <p className="text-xl font-bold text-green-600">katafuldo@gmail.com</p>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-block">
                  Réponse sous 2h
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm inline-block">
                  ✓ Devis gratuit
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-l-4 border-yellow-600">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-yellow-100 p-4 rounded-full">
                  <Wrench className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-4">Services Rapides</h3>
              <img 
                src="/images/groupe-electrogene.jpeg"
                alt="Ingénieur technique avec équipements de diagnostic"
                className="w-full h-32 object-cover rounded-lg mb-4 shadow-md"
                style={{ objectPosition: 'center' }}
              />
              <div className="text-center space-y-2">
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm inline-block">
                  Intervention 24h
                </div>
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm inline-block">
                  Garantie 2 ans
                </div>
                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm inline-block">
                  Certifié ISO
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center mt-12">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto border border-gray-100">
          <div className="flex items-center justify-center mb-6">
            <Logo size="large" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">FULBERT-ASKY-INGÉNIERIE</h3>
          <p className="text-lg text-gray-600 mb-8">
            Excellence en ingénierie électrique, électronique et cybersécurité depuis plus de 15 ans
          </p>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">15+</p>
              <p className="text-sm text-gray-600">Ans d'expérience</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-600">500+</p>
              <p className="text-sm text-gray-600">Projets réalisés</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">100%</p>
              <p className="text-sm text-gray-600">Satisfaction</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">24/7</p>
              <p className="text-sm text-gray-600">Disponibilité</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Logo size="large" />
            </div>
            <h3 className="text-2xl font-bold mb-2">FULBERT-ASKY-INGÉNIERIE</h3>
            <p className="text-gray-400 mb-2">
              Expert en ingénierie électrique, électronique et cybersécurité
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Solutions complètes pour le bâtiment, l'industrie et les systèmes informatiques
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500 mb-4">
              <span>📧 katafuldo@gmail.com</span>
              <span>📱 +228 70 87 22 84</span>
              <span>📱 +228 71 20 14 19</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2026 FULBERT-ASKY-INGÉNIERIE - Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
