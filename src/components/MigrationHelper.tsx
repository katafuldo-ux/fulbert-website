import { useEffect } from 'react'
import dataPersistence from '../utils/dataPersistence'

// Composant pour aider à la migration des données depuis localStorage vers l'API
export default function MigrationHelper() {
  useEffect(() => {
    // Lancer la migration au démarrage de l'application
    const migrateData = async () => {
      try {
        console.log('Début de la migration des données...')
        await dataPersistence.migrateOldData()
        console.log('Migration terminée avec succès')
      } catch (error) {
        console.error('Erreur lors de la migration:', error)
      }
    }

    // Exécuter la migration après 2 secondes pour laisser le temps à l'API de s'initialiser
    const timer = setTimeout(migrateData, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Ce composant ne rend rien visuellement
  return null
}
