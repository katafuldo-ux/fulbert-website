const fs = require('fs').promises;
const path = require('path');

// Chemin vers le fichier de données
const DATA_FILE = path.join(__dirname, '../../data/applications.json');

exports.handler = async (event, context) => {
  // Seulement autoriser les requêtes POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Méthode non autorisée' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    
    // Validation des données
    const required = ['fullName', 'email', 'phone', 'position'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Champs obligatoires manquants', 
          missing 
        })
      };
    }

    // Ajouter timestamp et ID
    const application = {
      id: Date.now().toString(),
      ...data,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Créer le dossier data s'il n'existe pas
    try {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    } catch (err) {
      // Le dossier existe déjà
    }

    // Lire les applications existantes
    let applications = [];
    try {
      const existingData = await fs.readFile(DATA_FILE, 'utf8');
      applications = JSON.parse(existingData);
    } catch (err) {
      // Le fichier n'existe pas encore
      applications = [];
    }

    // Ajouter la nouvelle application
    applications.push(application);

    // Sauvegarder
    await fs.writeFile(DATA_FILE, JSON.stringify(applications, null, 2));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        success: true, 
        application,
        message: 'Candidature enregistrée avec succès'
      })
    };

  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Erreur serveur',
        message: error.message 
      })
    };
  }
};
