// Utils de sécurité pour le chiffrement et la validation
const CRYPTO_KEY = 'fulbert-security-key-2024-secure-hash';

// Chiffrement simple pour localStorage (XOR-based)
export const encryptData = (data: string): string => {
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    encrypted += String.fromCharCode(
      data.charCodeAt(i) ^ CRYPTO_KEY.charCodeAt(i % CRYPTO_KEY.length)
    );
  }
  return btoa(encrypted);
};

export const decryptData = (encryptedData: string): string => {
  try {
    const decoded = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^ CRYPTO_KEY.charCodeAt(i % CRYPTO_KEY.length)
      );
    }
    return decrypted;
  } catch {
    return '';
  }
};

// Validation des entrées
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential XSS
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.length >= 8;
};

export const validateIdNumber = (idNumber: string): boolean => {
  // Validation basique pour CNI togolaise (format typique)
  const idRegex = /^[A-Z0-9]{8,15}$/;
  return idRegex.test(idNumber.replace(/\s/g, ''));
};

// Rate limiting simple
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const checkRateLimit = (identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean => {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);
  
  if (!attempts) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (now - attempts.lastAttempt > windowMs) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (attempts.count >= maxAttempts) {
    return false;
  }
  
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
};

// Génération de tokens sécurisés
export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Vérification de force de mot de passe
export const checkPasswordStrength = (password: string): { score: number; feedback: string[] } => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score += 1;
  else feedback.push('Au moins 8 caractères');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Une lettre minuscule');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Une lettre majuscule');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('Un chiffre');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Un caractère spécial');
  
  return { score, feedback };
};
