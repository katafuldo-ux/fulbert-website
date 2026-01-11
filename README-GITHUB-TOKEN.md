# Configuration du Token GitHub pour FULBERT-ASKY-INGÉNIERIE

## Étape 1 : Créer un Personal Access Token

1. Allez sur : https://github.com/settings/tokens
2. Cliquez sur **"Generate new token (classic)"**
3. Remplissez :
   - **Note** : `FULBERT-ASKY-INGÉNIERIE Website`
   - **Expiration** : `90 days` ou `No expiration`
4. Cochez les permissions :
   - ✅ **repo** (Full control of private repositories)
   - ✅ **repo:status** (Access commit status)
   - ✅ **public_repo** (Access public repositories)
5. Cliquez sur **"Generate token"**
6. **COPIEZ IMMÉDIATEMENT** le token (il ne s'affichera plus jamais)

## Étape 2 : Configurer le token

### Option A : Via GitHub Pages (recommandé)

1. Allez sur : https://github.com/katafuldo-ux/fulbert-website/settings/pages
2. Dans **"Build and deployment"** → **"Environment"**
3. Cliquez sur **"Environment variables"**
4. Ajoutez :
   - **Name** : `VITE_GITHUB_TOKEN`
   - **Value** : votre token copié
5. Cliquez **"Save environment variables"**

### Option B : Via le fichier .env

1. Éditez le fichier `.env` dans le projet
2. Remplacez `ghp_YOUR_GITHUB_TOKEN_HERE` par votre vrai token :
   ```
   VITE_GITHUB_TOKEN=ghp_votre_vrai_token_ici
   ```

## Étape 3 : Déployer

Le site se redéploiera automatiquement après 2-3 minutes.

## Vérification

Après déploiement :
1. Allez sur : https://katafuldo-ux.github.io/fulbert-website/#admin
2. Login : `admin@fulbert.com` / `admin123`
3. Vous devriez voir : "Aucune candidature trouvée" (si c'est vide)
4. Testez un formulaire de candidature
5. Retournez à l'admin → la nouvelle candidature apparaît !

## Fonctionnement

- ✅ **Candidatures** → Créent des Issues GitHub avec label `candidature`
- ✅ **Demandes clients** → Créent des Issues avec label `demande-client`
- ✅ **Admin** → Lit les Issues GitHub en temps réel
- ✅ **Données permanentes** → Stockées dans GitHub (plus de localStorage)

## Sécurité

- Le token est sécurisé dans les variables d'environnement
- Les données sont stockées dans votre repository GitHub
- Seul vous avez accès aux Issues de votre repository
