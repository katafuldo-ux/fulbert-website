// Copie de la Netlify Function pour Vercel
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'api-data.json');

// Assurer que le dossier data existe
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialiser le fichier de données s'il n'existe pas
if (!fs.existsSync(DATA_FILE)) {
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
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Helper functions
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return {
      clients: [],
      jobApplications: [],
      serviceRequests: [],
      websiteStats: { visitors: [], totalVisits: 0, uniqueVisitorCount: 0, lastUpdated: new Date().toISOString() },
      userAccounts: [],
      clientRequests: []
    };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
}

function generateId() {
  return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
}

// Main handler
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/').filter(part => part);
    
    // API endpoint: /api/data-api/...
    if (pathParts[0] === 'api' && pathParts[1] === 'data-api') {
      const data = readData();
      const resource = pathParts[2];
      const id = pathParts[3];

      // GET all data
      if (req.method === 'GET' && !resource) {
        return res.status(200).json({ success: true, data });
      }

      // GET specific resource
      if (req.method === 'GET' && resource) {
        const resourceData = data[resource] || [];
        return res.status(200).json({ success: true, data: resourceData });
      }

      // POST new item
      if (req.method === 'POST' && resource) {
        const newItem = req.body;
        if (!newItem.id) {
          newItem.id = generateId();
        }
        newItem.createdAt = new Date().toISOString();
        
        if (!data[resource]) {
          data[resource] = [];
        }
        data[resource].push(newItem);
        
        if (writeData(data)) {
          return res.status(201).json({ success: true, data: newItem });
        } else {
          return res.status(500).json({ success: false, error: 'Failed to save data' });
        }
      }

      // PUT update item
      if (req.method === 'PUT' && resource && id) {
        const updates = req.body;
        const items = data[resource] || [];
        const index = items.findIndex(item => item.id === id);
        
        if (index === -1) {
          return res.status(404).json({ success: false, error: 'Item not found' });
        }
        
        data[resource][index] = { ...data[resource][index], ...updates, updatedAt: new Date().toISOString() };
        
        if (writeData(data)) {
          return res.status(200).json({ success: true, data: data[resource][index] });
        } else {
          return res.status(500).json({ success: false, error: 'Failed to update data' });
        }
      }

      // DELETE item
      if (req.method === 'DELETE' && resource && id) {
        const items = data[resource] || [];
        const index = items.findIndex(item => item.id === id);
        
        if (index === -1) {
          return res.status(404).json({ success: false, error: 'Item not found' });
        }
        
        data[resource].splice(index, 1);
        
        if (writeData(data)) {
          return res.status(200).json({ success: true, message: 'Item deleted successfully' });
        } else {
          return res.status(500).json({ success: false, error: 'Failed to delete data' });
        }
      }
    }

    // 404 for other routes
    return res.status(404).json({ success: false, error: 'Not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
