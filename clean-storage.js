// Script pour nettoyer les données demo
if (typeof window !== 'undefined') {
  // Supprimer toutes les données demo
  localStorage.removeItem('jobApplications');
  localStorage.removeItem('clientRequests');
  localStorage.removeItem('userAccounts');
  localStorage.removeItem('websiteStats');
  localStorage.removeItem('adminSession');
  localStorage.removeItem('isAdminAuthenticated');
  
  // Nettoyer aussi sessionStorage
  sessionStorage.clear();
  
  console.log('Toutes les données ont été nettoyées');
}
