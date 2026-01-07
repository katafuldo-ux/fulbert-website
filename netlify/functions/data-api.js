const fs = require('fs').promises;
const path = require('path');

// Chemin vers le fichier de données
const DATA_FILE = path.join(__dirname, '../../data/app-data.json');

// Initialiser le fichier de données s'il n'existe pas
async function initDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // Le fichier n'existe pas, le créer avec des données initiales
    const initialData = {
      clients: [],
      jobApplications: [],
      serviceRequests: [],
      websiteStats: {
        visitors: [],
        totalVisits: 0,
        uniqueVisitorCount: 0,
        lastUpdated: new Date().toISOString()
      },
      userAccounts: [],
      clientRequests: []
    };
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Lire toutes les données
async function readData() {
  try {
    await initDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lecture données:', error);
    return {
      clients: [],
      jobApplications: [],
      serviceRequests: [],
      websiteStats: {
        visitors: [],
        totalVisits: 0,
        uniqueVisitorCount: 0,
        lastUpdated: new Date().toISOString()
      },
      userAccounts: [],
      clientRequests: []
    };
  }
}

// Écrire toutes les données
async function writeData(data) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    console.error('Erreur écriture données:', error);
    return { success: false, error: error.message };
  }
}

// Handler principal
exports.handler = async (event, context) => {
  // Ajouter les headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Gérer les requêtes OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { httpMethod, path, body } = event;
    const data = await readData();
    
    // Parser le corps de la requête si nécessaire
    let requestBody = null;
    if (body && (httpMethod === 'POST' || httpMethod === 'PUT')) {
      try {
        requestBody = JSON.parse(body);
      } catch (e) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'JSON invalide' })
        };
      }
    }

    // Router la requête
    const pathParts = path.split('/').filter(p => p);
    const resource = pathParts[1]; // data-api/{resource}
    const id = pathParts[2]; // data-api/{resource}/{id}

    let response;

    switch (resource) {
      case 'clients':
        response = handleClients(httpMethod, data, requestBody, id);
        break;
      case 'jobApplications':
        response = handleJobApplications(httpMethod, data, requestBody, id);
        break;
      case 'serviceRequests':
        response = handleServiceRequests(httpMethod, data, requestBody, id);
        break;
      case 'websiteStats':
        response = handleWebsiteStats(httpMethod, data, requestBody);
        break;
      case 'userAccounts':
        response = handleUserAccounts(httpMethod, data, requestBody, id);
        break;
      case 'clientRequests':
        response = handleClientRequests(httpMethod, data, requestBody, id);
        break;
      case 'all':
        // Endpoint pour récupérer toutes les données
        if (httpMethod === 'GET') {
          response = { success: true, data };
        } else {
          response = { success: false, error: 'Méthode non autorisée' };
        }
        break;
      default:
        response = { success: false, error: 'Ressource non trouvée' };
    }

    // Sauvegarder les données si elles ont été modifiées
    if (response.success !== false && (httpMethod === 'POST' || httpMethod === 'PUT' || httpMethod === 'DELETE')) {
      const writeResult = await writeData(data);
      if (!writeResult.success) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Erreur sauvegarde données' })
        };
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Erreur serveur:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erreur serveur interne' })
    };
  }
};

// Handlers pour chaque ressource
function handleClients(method, data, body, id) {
  switch (method) {
    case 'GET':
      return { success: true, data: data.clients };
    case 'POST':
      if (!body) return { success: false, error: 'Données manquantes' };
      data.clients.push(body);
      return { success: true, data: body };
    case 'PUT':
      if (!id || !body) return { success: false, error: 'ID ou données manquantes' };
      const index = data.clients.findIndex(c => c.id === id);
      if (index === -1) return { success: false, error: 'Client non trouvé' };
      data.clients[index] = { ...data.clients[index], ...body };
      return { success: true, data: data.clients[index] };
    case 'DELETE':
      if (!id) return { success: false, error: 'ID manquant' };
      const clientIndex = data.clients.findIndex(c => c.id === id);
      if (clientIndex === -1) return { success: false, error: 'Client non trouvé' };
      data.clients.splice(clientIndex, 1);
      return { success: true };
    default:
      return { success: false, error: 'Méthode non autorisée' };
  }
}

function handleJobApplications(method, data, body, id) {
  switch (method) {
    case 'GET':
      return { success: true, data: data.jobApplications };
    case 'POST':
      if (!body) return { success: false, error: 'Données manquantes' };
      data.jobApplications.push(body);
      return { success: true, data: body };
    case 'PUT':
      if (!id || !body) return { success: false, error: 'ID ou données manquantes' };
      const index = data.jobApplications.findIndex(a => a.id === id);
      if (index === -1) return { success: false, error: 'Candidature non trouvée' };
      data.jobApplications[index] = { ...data.jobApplications[index], ...body };
      return { success: true, data: data.jobApplications[index] };
    case 'DELETE':
      if (!id) return { success: false, error: 'ID manquant' };
      const appIndex = data.jobApplications.findIndex(a => a.id === id);
      if (appIndex === -1) return { success: false, error: 'Candidature non trouvée' };
      data.jobApplications.splice(appIndex, 1);
      return { success: true };
    default:
      return { success: false, error: 'Méthode non autorisée' };
  }
}

function handleServiceRequests(method, data, body, id) {
  switch (method) {
    case 'GET':
      return { success: true, data: data.serviceRequests };
    case 'POST':
      if (!body) return { success: false, error: 'Données manquantes' };
      data.serviceRequests.push(body);
      return { success: true, data: body };
    case 'PUT':
      if (!id || !body) return { success: false, error: 'ID ou données manquantes' };
      const index = data.serviceRequests.findIndex(r => r.id === id);
      if (index === -1) return { success: false, error: 'Demande non trouvée' };
      data.serviceRequests[index] = { ...data.serviceRequests[index], ...body };
      return { success: true, data: data.serviceRequests[index] };
    case 'DELETE':
      if (!id) return { success: false, error: 'ID manquant' };
      const reqIndex = data.serviceRequests.findIndex(r => r.id === id);
      if (reqIndex === -1) return { success: false, error: 'Demande non trouvée' };
      data.serviceRequests.splice(reqIndex, 1);
      return { success: true };
    default:
      return { success: false, error: 'Méthode non autorisée' };
  }
}

function handleWebsiteStats(method, data, body) {
  switch (method) {
    case 'GET':
      return { success: true, data: data.websiteStats };
    case 'POST':
      if (!body) return { success: false, error: 'Données manquantes' };
      data.websiteStats = { ...data.websiteStats, ...body };
      return { success: true, data: data.websiteStats };
    default:
      return { success: false, error: 'Méthode non autorisée' };
  }
}

function handleUserAccounts(method, data, body, id) {
  switch (method) {
    case 'GET':
      return { success: true, data: data.userAccounts };
    case 'POST':
      if (!body) return { success: false, error: 'Données manquantes' };
      data.userAccounts.push(body);
      return { success: true, data: body };
    case 'PUT':
      if (!id || !body) return { success: false, error: 'ID ou données manquantes' };
      const index = data.userAccounts.findIndex(a => a.id === id);
      if (index === -1) return { success: false, error: 'Compte non trouvé' };
      data.userAccounts[index] = { ...data.userAccounts[index], ...body };
      return { success: true, data: data.userAccounts[index] };
    case 'DELETE':
      if (!id) return { success: false, error: 'ID manquant' };
      const accIndex = data.userAccounts.findIndex(a => a.id === id);
      if (accIndex === -1) return { success: false, error: 'Compte non trouvé' };
      data.userAccounts.splice(accIndex, 1);
      return { success: true };
    default:
      return { success: false, error: 'Méthode non autorisée' };
  }
}

function handleClientRequests(method, data, body, id) {
  switch (method) {
    case 'GET':
      return { success: true, data: data.clientRequests };
    case 'POST':
      if (!body) return { success: false, error: 'Données manquantes' };
      data.clientRequests.push(body);
      return { success: true, data: body };
    case 'PUT':
      if (!id || !body) return { success: false, error: 'ID ou données manquantes' };
      const index = data.clientRequests.findIndex(r => r.id === id);
      if (index === -1) return { success: false, error: 'Demande client non trouvée' };
      data.clientRequests[index] = { ...data.clientRequests[index], ...body };
      return { success: true, data: data.clientRequests[index] };
    case 'DELETE':
      if (!id) return { success: false, error: 'ID manquant' };
      const reqIndex = data.clientRequests.findIndex(r => r.id === id);
      if (reqIndex === -1) return { success: false, error: 'Demande client non trouvée' };
      data.clientRequests.splice(reqIndex, 1);
      return { success: true };
    default:
      return { success: false, error: 'Méthode non autorisée' };
  }
}
