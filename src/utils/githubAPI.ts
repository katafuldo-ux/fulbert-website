// Service API pour utiliser GitHub comme base de données via Issues

const GITHUB_TOKEN = (import.meta as any).env?.VITE_GITHUB_TOKEN || 'ghp_YOUR_TOKEN_HERE'
const REPO_OWNER = 'katafuldo-ux'
const REPO_NAME = 'fulbert-website'

interface GitHubIssue {
  title: string
  body: string
  labels: string[]
}

interface ApplicationData {
  fullName: string
  email: string
  phone: string
  position: string
  experience?: string
  education?: string
  skills?: string
  motivation?: string
  availability?: string
  salary?: string
  address?: string
  city?: string
  country?: string
  idNumber?: string
}

interface ClientRequestData {
  clientId: string
  type: string
  title: string
  description: string
  urgency: string
  budget?: string
  deadline?: string
  clientName: string
  clientEmail: string
  clientPhone: string
}

class GitHubAPIService {
  private getHeaders(): Record<string, string> {
    const token = (import.meta as any).env?.VITE_GITHUB_TOKEN || 'ghp_YOUR_TOKEN_HERE'
    
    // Si pas de token valide, utiliser mode démo
    if (token === 'ghp_YOUR_TOKEN_HERE') {
      return {
        'Content-Type': 'application/json',
        'X-Demo-Mode': 'true'
      }
    }
    
    return {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    }
  }

  private isDemoMode(): boolean {
    const token = (import.meta as any).env?.VITE_GITHUB_TOKEN || 'ghp_YOUR_TOKEN_HERE'
    return token === 'ghp_YOUR_TOKEN_HERE'
  }

  private createDemoIssue(data: any): any {
    return {
      id: Math.floor(Math.random() * 1000000),
      title: data.title || `Issue de démo`,
      body: data.body || 'Contenu de démo',
      state: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      labels: data.labels || [],
      user: { login: 'demo-user' }
    }
  }

  async createApplicationIssue(data: ApplicationData): Promise<any> {
    // Mode démo si pas de token
    if (this.isDemoMode()) {
      console.log('Mode démo: Simulation de création de candidature', data)
      const demoIssue = this.createDemoIssue({
        title: `Candidature: ${data.position} - ${data.fullName}`,
        body: this.formatApplicationBody(data),
        labels: ['candidature', data.position, data.experience || '0-1']
      })
      
      // Sauvegarder en localStorage pour la démo
      const storedApps = JSON.parse(localStorage.getItem('demo_applications') || '[]')
      storedApps.push(demoIssue)
      localStorage.setItem('demo_applications', JSON.stringify(storedApps))
      
      return demoIssue
    }

    const issueBody = this.formatApplicationBody(data)
    
    const issue: GitHubIssue = {
      title: `Candidature: ${data.position} - ${data.fullName}`,
      body: issueBody,
      labels: ['candidature', data.position, data.experience || '0-1']
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(issue)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('GitHub API Error Details:', errorData)
        throw new Error(`GitHub API Error: ${response.status} - ${errorData.message || 'Unknown error'}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erreur création issue candidature:', error)
      throw error
    }
  }

  async createClientRequestIssue(data: ClientRequestData): Promise<any> {
    const issueBody = this.formatClientRequestBody(data)
    
    const issue: GitHubIssue = {
      title: `Demande Client: ${data.type} - ${data.title}`,
      body: issueBody,
      labels: ['demande-client', data.type, data.urgency]
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(issue)
        }
      )

      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erreur création issue demande client:', error)
      throw error
    }
  }

  async getIssues(labels: string[] = []): Promise<any[]> {
    // Mode démo si pas de token
    if (this.isDemoMode()) {
      console.log('Mode démo: Simulation de récupération des issues')
      
      // Récupérer les données démo du localStorage
      const storedApps = JSON.parse(localStorage.getItem('demo_applications') || '[]')
      const storedRequests = JSON.parse(localStorage.getItem('demo_requests') || '[]')
      
      // Combiner données démo + données stockées
      let demoData = [...storedApps, ...storedRequests]
      
      // Si pas de données stockées, utiliser les données par défaut
      if (demoData.length === 0) {
        if (labels.includes('candidature')) {
          demoData = [
            this.createDemoIssue({
              title: 'Candidature de démo - Ingénieur Électricien',
              body: `## 📋 CANDIDATURE SPONTANÉE

### 👤 Informations Personnelles
- **Nom Complet**: Jean Dupont
- **Email**: jean.dupont@email.com
- **Téléphone**: +228 90 12 34 56
- **Numéro CNI**: 1234567890123

### 💼 Position Recherchée
- **Poste**: Ingénieur Électricien
- **Expérience**: 3-5 ans
- **Niveau d'études**: Master

### 🎯 Compétences et Motivation
- **Compétences**: Électricité industrielle, Automatisation, CAO
- **Motivation**: Passionné par les projets industriels
- **Disponibilité**: Immédiate

---
*Soumis le: ${new Date().toLocaleDateString('fr-TG')}*
*Statut: En attente de traitement*`,
              labels: ['candidature', 'Ingénieur', '3-5']
            }),
            this.createDemoIssue({
              title: 'Candidature de démo - Technicien Cybersécurité',
              body: `## 📋 CANDIDATURE SPONTANÉE

### 👤 Informations Personnelles
- **Nom Complet**: Marie Kouma
- **Email**: marie.kouma@email.com
- **Téléphone**: +228 91 23 45 67
- **Numéro CNI**: 9876543210987

### 💼 Position Recherchée
- **Poste**: Technicien Cybersécurité
- **Expérience**: 1-2 ans
- **Niveau d'études**: Licence

### 🎯 Compétences et Motivation
- **Compétences**: Sécurité réseau, Audit, Antivirus
- **Motivation**: Intéressée par la protection des systèmes
- **Disponibilité**: 1 mois

---
*Soumis le: ${new Date().toLocaleDateString('fr-TG')}*
*Statut: En attente de traitement*`,
              labels: ['candidature', 'Technicien', '1-2']
            })
          ]
        }
        
        if (labels.includes('demande-client')) {
          demoData = demoData.concat([
            this.createDemoIssue({
              title: 'Demande client de démo - Installation électrique',
              body: `## 📝 DEMANDE CLIENT

### 👤 Informations Client
- **Nom**: Entreprise ABC
- **Email**: contact@entreprise-abc.tg
- **Téléphone**: +228 22 33 44 55
- **ID Client**: client_123456

### 📋 Détails de la Demande
- **Type**: service
- **Titre**: Installation électrique complète
- **Description**: Installation du système électrique pour notre nouveau bâtiment de 500m²
- **Urgence**: urgent

### 💰 Informations Complémentaires
- **Budget**: 2.000.000 FCFA
- **Délai**: 1 mois

---
*Soumis le: ${new Date().toLocaleDateString('fr-TG')}*
*Statut: En attente de traitement*`,
              labels: ['demande-client', 'service', 'urgent']
            })
          ])
        }
      }
      
      // Filtrer par labels si demandé
      if (labels.length > 0) {
        demoData = demoData.filter((item: any) => 
          labels.some(label => item.labels.some((l: any) => l.name === label))
        )
      }
      
      return demoData
    }

    try {
      const labelQuery = labels.length > 0 ? `+labels:${labels.join(',')}` : ''
      const response = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=all${labelQuery}`,
        {
          headers: this.getHeaders()
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('GitHub API Error Details:', errorData)
        throw new Error(`GitHub API Error: ${response.status} - ${errorData.message || 'Unknown error'}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erreur récupération issues:', error)
      throw error
    }
  }

  async getApplications(): Promise<any[]> {
    return this.getIssues(['candidature'])
  }

  async getClientRequests(): Promise<any[]> {
    return this.getIssues(['demande-client'])
  }

  private formatApplicationBody(data: ApplicationData): string {
    return `
## 📋 CANDIDATURE SPONTANÉE

### 👤 Informations Personnelles
- **Nom Complet**: ${data.fullName}
- **Email**: ${data.email}
- **Téléphone**: ${data.phone}
- **Numéro CNI**: ${data.idNumber || 'Non spécifié'}

### 💼 Position Recherchée
- **Poste**: ${data.position}
- **Expérience**: ${data.experience || 'Non spécifié'}
- **Niveau d'études**: ${data.education || 'Non spécifié'}

### 📍 Coordonnées
- **Adresse**: ${data.address || 'Non spécifié'}
- **Ville**: ${data.city || 'Non spécifié'}
- **Pays**: ${data.country || 'Togo'}

### 🎯 Compétences et Motivation
- **Compétences**: ${data.skills || 'Non spécifié'}
- **Motivation**: ${data.motivation || 'Non spécifié'}
- **Disponibilité**: ${data.availability || 'Non spécifié'}
- **Prétentions salariales**: ${data.salary || 'Non spécifié'}

---
*Soumis le: ${new Date().toLocaleDateString('fr-TG')}*
*Statut: En attente de traitement*
    `.trim()
  }

  private formatClientRequestBody(data: ClientRequestData): string {
    return `
## 📝 DEMANDE CLIENT

### 👤 Informations Client
- **Nom**: ${data.clientName}
- **Email**: ${data.clientEmail}
- **Téléphone**: ${data.clientPhone}
- **ID Client**: ${data.clientId}

### 📋 Détails de la Demande
- **Type**: ${data.type}
- **Titre**: ${data.title}
- **Description**: ${data.description}
- **Urgence**: ${data.urgency}

### 💰 Informations Complémentaires
- **Budget**: ${data.budget || 'Non spécifié'}
- **Délai**: ${data.deadline || 'Non spécifié'}

---
*Soumis le: ${new Date().toLocaleDateString('fr-TG')}*
*Statut: En attente de traitement*
    `.trim()
  }
}

export default new GitHubAPIService()
