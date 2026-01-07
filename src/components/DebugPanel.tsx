import { useState, useEffect } from 'react'

export default function DebugPanel() {
  const [localStorageData, setLocalStorageData] = useState<any>({})
  const [apiData, setApiData] = useState<any>({})

  useEffect(() => {
    // Vérifier les données localStorage
    const checkData = () => {
      const localData = {
        jobApplications: localStorage.getItem('jobApplications'),
        clients: localStorage.getItem('clients'),
        serviceRequests: localStorage.getItem('serviceRequests'),
        websiteStats: localStorage.getItem('websiteStats')
      }
      setLocalStorageData(localData)

      // Tester l'API
      fetch('/.netlify/functions/data-api/all')
        .then(res => res.json())
        .then(data => {
          console.log('API Response:', data)
          setApiData(data)
        })
        .catch(err => {
          console.error('API Error:', err)
          setApiData({ error: err.message })
        })
    }

    checkData()
    const interval = setInterval(checkData, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Debug Panel</h3>
      
      <div className="mb-2">
        <strong>LocalStorage:</strong>
        <pre className="text-green-400">
          {JSON.stringify(localStorageData, null, 2)}
        </pre>
      </div>
      
      <div>
        <strong>API Response:</strong>
        <pre className="text-blue-400">
          {JSON.stringify(apiData, null, 2)}
        </pre>
      </div>
      
      <div className="mt-2 text-yellow-400">
        <strong>Actions:</strong>
        <ul className="list-disc list-inside">
          <li>Vérifiez la console navigateur (F12)</li>
          <li>Testez: /admin</li>
          <li>Testez: /client</li>
        </ul>
      </div>
    </div>
  )
}
