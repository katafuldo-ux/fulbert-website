import { motion } from 'framer-motion'
import { Phone, Mail, Zap, Shield, Wrench, Building, Factory, Lock, Globe, CheckCircle } from 'lucide-react'

function App() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold gradient-text">FULBERT</h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#accueil" className="text-gray-700 hover:text-primary-600 transition-colors">Accueil</a>
              <a href="#electricite" className="text-gray-700 hover:text-primary-600 transition-colors">Électricité</a>
              <a href="#cybersecurite" className="text-gray-700 hover:text-primary-600 transition-colors">Cybersécurité</a>
              <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="accueil" className="hero-gradient pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Bonjour, je suis <span className="gradient-text">FULBERT</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8">
                Spécialiste en électricité (bâtiment et industrie) et cybersécurité informatique
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#electricite" className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors">
                  Services Électriques
                </a>
                <a href="#cybersecurite" className="bg-secondary-600 text-white px-8 py-3 rounded-lg hover:bg-secondary-700 transition-colors">
                  Cybersécurité
                </a>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1621905492505-bd203136c5256?w=600&h=400&fit=crop&auto=format" 
                alt="Professional electrician and cybersecurity expert"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-4 -right-4 bg-primary-600 text-white p-3 rounded-xl">
                <Zap className="w-8 h-8" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Électricité Section */}
      <section id="electricite" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center mb-4">
              <Zap className="w-12 h-12 text-primary-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Services Électriques</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Solutions complètes en électricité pour le bâtiment et l'industrie
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-lg card-hover"
            >
              <div className="flex items-center mb-6">
                <Building className="w-8 h-8 text-primary-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Électricité du Bâtiment</h3>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&h=250&fit=crop&auto=format"
                alt="Building electrical work"
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Installation et mise aux normes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Maintenance et dépannage</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Rénovation électrique complète</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Éclairage et domotique</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Tableaux électriques et sécurité</span>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-lg card-hover"
            >
              <div className="flex items-center mb-6">
                <Factory className="w-8 h-8 text-primary-600 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Électricité Industrielle</h3>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&h=250&fit=crop&auto=format"
                alt="Industrial electrical work"
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Équipements industriels</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Automatisation et contrôle</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Machines et outillage électrique</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Armoires électriques industrielles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Maintenance préventive et curative</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cybersécurité Section */}
      <section id="cybersecurite" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-secondary-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cybersécurité</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Protection complète de vos systèmes informatiques et données
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gray-50 p-6 rounded-xl card-hover"
            >
              <Lock className="w-10 h-10 text-secondary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurité des Systèmes</h3>
              <img 
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&auto=format"
                alt="System security"
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <ul className="space-y-2 text-gray-600">
                <li>• Audit de sécurité</li>
                <li>• Configuration sécurisée</li>
                <li>• Mise à jour des systèmes</li>
                <li>• Surveillance continue</li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-50 p-6 rounded-xl card-hover"
            >
              <Globe className="w-10 h-10 text-secondary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurité Réseau</h3>
              <img 
                src="https://images.unsplash.com/photo-1558494946-ef010cbdcc31a?w=400&h=200&fit=crop&auto=format"
                alt="Network security"
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <ul className="space-y-2 text-gray-600">
                <li>• Pare-feu et filtrage</li>
                <li>• VPN sécurisé</li>
                <li>• Détection d'intrusion</li>
                <li>• Segmentation réseau</li>
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-50 p-6 rounded-xl card-hover"
            >
              <Shield className="w-10 h-10 text-secondary-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Protection des Données</h3>
              <img 
                src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop&auto=format"
                alt="Data protection"
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <ul className="space-y-2 text-gray-600">
                <li>• Chiffrement des données</li>
                <li>• Sauvegarde sécurisée</li>
                <li>• Plan de reprise d'activité</li>
                <li>• Sensibilisation des équipes</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Contactez-moi</h2>
            <p className="text-xl text-gray-600">
              Pour tous vos projets électriques et de cybersécurité
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <div className="flex items-center mb-6">
                <Phone className="w-6 h-6 text-primary-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Téléphone</h3>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop&auto=format"
                alt="Contact phone"
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <p className="text-gray-600 mb-2">+228 70 87 22 84</p>
              <p className="text-gray-600">+228 71 20 14 19</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <div className="flex items-center mb-6">
                <Mail className="w-6 h-6 text-primary-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Email</h3>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&h=200&fit=crop&auto=format"
                alt="Contact email"
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <p className="text-gray-600">katafuldo@gmail.com</p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mt-12"
          >
            <p className="text-lg text-gray-600 mb-4">
              Disponible pour intervenir rapidement sur vos projets
            </p>
            <div className="inline-flex items-center bg-primary-100 text-primary-800 px-6 py-3 rounded-lg">
              <Wrench className="w-5 h-5 mr-2" />
              <span className="font-semibold">ASKY Électrique</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">FULBERT</h3>
            <p className="text-gray-400 mb-4">
              Spécialiste en électricité et cybersécurité
            </p>
            <p className="text-gray-500 text-sm">
              © 2026 FULBERT - Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
