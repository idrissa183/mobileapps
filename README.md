# 📱 Application Mobile Banking

Application mobile de gestion bancaire développée avec **React Native** et **Expo**, connectée à un backend **FastAPI**.

---

## 🚀 Fonctionnalités principales

- Authentification sécurisée (connexion / inscription)
- Vérification par **OTP** (valide 1 minute)
- Gestion des comptes bancaires
- Visualisation des cartes bancaires
- Historique des transactions
- Gestion du profil et des paramètres
- Liste et détails des contacts

---

## 🔐 Authentification

### 1. Connexion

L'utilisateur peut se connecter s'il possède déjà un compte :

- Champs requis : `username` et `password`
- Contraintes sur le mot de passe :
  - Minimum 8 caractères
  - Au moins 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial

👉 Si l'utilisateur ne possède pas de compte, il peut cliquer sur **Sign Up** pour s'inscrire.

### 2. Inscription

L'utilisateur doit renseigner les informations suivantes :

- Nom d'utilisateur (`Username`)
- Nom complet (`Full name`)
- Email
- Mot de passe (`Password`)
- Confirmation du mot de passe (`Confirm Password`)
- Numéro de téléphone (`Téléphone`)

📧 Un **OTP (One-Time Password)** est envoyé à l'adresse e-mail fournie (vérifiez le dossier spam si besoin).

### 3. Vérification OTP

- Le code OTP est valide pendant **1 minute**
- Une fois validé, l'utilisateur est redirigé automatiquement vers la page de connexion

---

## 🏦 Gestion des comptes

- Lors de l'inscription, un compte bancaire est automatiquement créé pour l'utilisateur
- Il peut ensuite :
  - Créer des cartes bancaires
  - Effectuer des opérations :
    - Débit (Retrait)
    - Crédit (Recharge / Top-Up)
    - Transfert d'argent

---

## 🎨 Aperçus de l'application

### Authentification
| Connexion | Inscription | Vérification OTP |
|----------|-------------|------------------|
| ![Login](/frontend/Banking/Readme/login.jpeg) | ![Signup](/frontend/Banking/Readme/signup.jpeg) | ![OTP](/frontend/Banking/Readme/token.jpg) |

### Navigation
| Accueil | Paramètres | Déconnexion |
|--------|------------|-------------|
| ![Home](/frontend/Banking/Readme/home.jpg) | ![Settings](/frontend/Banking/Readme/settings.jpg) | ![Logout](/frontend/Banking/Readme/logout.jpg) |

### Cartes
| Liste des cartes | Création de carte | Détails de carte |
|------------------|-------------------|------------------|
| ![Cards](/frontend/Banking/Readme/card.jpg) | ![Create Card](/frontend/Banking/Readme/card222.jpg) | ![Card Info](/frontend/Banking/Readme/card3.jpg) |

### Transactions
| Historique | Détail d'une transaction | |
|-----------|---------------------------|----|
| ![History1](/frontend/Banking/Readme/history1.jpg) | ![History2](/frontend/Banking/Readme/history2.jpg) |   |

### Contacts
| Liste des contacts | Détails d’un contact | |
|--------------------|-----------------------|--|
| ![Contact](/frontend/Banking/Readme/contact.jpg) | ![Contact2](/frontend/Banking/Readme/contact2.jpg) | |

---

## 🚀 Déploiement

- **Backend** : Déployé sur [Render](https://banque-vgx0.onrender.com/api/docs)

---

## 🧪 Utilisateurs de test

Vous pouvez utiliser les comptes suivants pour tester rapidement l'application :

```plaintext
username: youmani
password: P@ssword123

username: idrissa183
password: P@ssword123
```

##  Technologies utilisées

* **Frontend**
  - Expo
  - React Native
  - Axios
  - Navigation
  
* **Backend**
  - FastAPI
  - MongoDB
  - Beanie
  - Pydantic
  
## Installation

### Clonage du projet depuis github

```sh
git clone https://github.com/idrissa183/mobileapps.git
```

### Naviguer vers le dossier principal du projet

```sh
cd mobileapps
```

### Lister les dossiers existants

```sh
ls 
```

### Découverte

Vous trouverez deux dossiers:

- **Backend** (déjà déployé sur Render) qui contient la logique métier de l'application.
- **Frontend** (apk disponible)


### Installation des dépendances

Nous testons le frontend sur la base du backend déjà déployé.

Naviguer vers le frontend Banking.

```sh
cd frontend/Banking
```

Installer les dépendances avec l'option **--legacy-peer-deps** pour bypasser les problèmes de dépendances.

```sh
npm install --legacy-peer-deeps
```

Lancer le projet en exécutant la commande suivante

```sh
npm start
```

## Test direct
Utiliser l'apk et l'installer manuellement
## Contributeurs

* **COMPAORE Walker**
* **OUEDRAOGO Idrissa**
* **OUEDRAOGO Alex Fayçal**