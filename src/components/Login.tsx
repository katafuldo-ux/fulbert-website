import { useState } from 'react'
import { User, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { checkRateLimit, sanitizeInput, generateSecureToken } from '../utils/security'

interface LoginProps {
  onLogin: (success: boolean) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const [lockTimeLeft, setLockTimeLeft] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Nettoyer les entrées
    const cleanUsername = sanitizeInput(username.trim())
    const cleanPassword = sanitizeInput(password)
    
    // Vérifier le rate limiting
    const clientIdentifier = navigator.userAgent + cleanUsername
    if (!checkRateLimit(clientIdentifier)) {
      setError('Trop de tentatives. Veuillez réessayer dans 15 minutes.')
      setIsLocked(true)
      setLockTimeLeft(15 * 60)
      
      const countdown = setInterval(() => {
        setLockTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdown)
            setIsLocked(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return
    }
    
    // Vérification des identifiants avec hashage simple
    const hashPassword = (pwd: string): string => {
      let hash = 0
      for (let i = 0; i < pwd.length; i++) {
        const char = pwd.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
      return hash.toString()
    }
    
    // Identifiants hashés (plus sécurisés que en dur)
    const ADMIN_USERNAME_HASH = '1594048874' // hash de 'ASKYAKAZZA'
    const ADMIN_PASSWORD_HASH = '365757713' // hash de '98806000'
    
    if (hashPassword(cleanUsername) === ADMIN_USERNAME_HASH && hashPassword(cleanPassword) === ADMIN_PASSWORD_HASH) {
      // Générer un token de session sécurisé
      const sessionToken = generateSecureToken()
      const sessionData = {
        token: sessionToken,
        username: cleanUsername,
        loginTime: Date.now(),
        expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 heures
      }
      
      localStorage.setItem('adminSession', JSON.stringify(sessionData))
      localStorage.setItem('isAdminAuthenticated', 'true')
      onLogin(true)
    } else {
      setError('Identifiants incorrects')
      setTimeout(() => setError(''), 3000)
    }
  }

  const formatLockTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Espace Administrateur</h1>
          <p className="text-sm text-gray-600">FULBERT-ASKY-INGÉNIERIE</p>
        </div>

        {isLocked ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Compte Temporairement Bloqué</h3>
            <p className="text-gray-600 mb-4">
              Trop de tentatives de connexion échouées.
            </p>
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-600">Réessayez dans:</p>
              <p className="text-2xl font-bold text-red-600">{formatLockTime(lockTimeLeft)}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[<>]/g, ''))}
                  required
                  maxLength={50}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom d'utilisateur"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  {error}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Se connecter
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Accès sécurisé et réservé aux administrateurs</p>
          <p className="text-xs mt-1">Session de 8 heures maximum</p>
        </div>
      </div>
    </div>
  )
}
