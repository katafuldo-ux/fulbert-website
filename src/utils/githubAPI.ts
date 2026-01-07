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
  private getHeaders() {
    const token = (import.meta as any).env?.VITE_GITHUB_TOKEN || 'ghp_YOUR_TOKEN_HERE'
    
    return {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    }
  }

  async createApplicationIssue(data: ApplicationData): Promise<any> {
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
