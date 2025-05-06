# Application Mobile Banking

Application mobile de gestion bancaire développée avec React Native et Expo, avec un backend FastAPI.

## Fonctionnalités principales

- Authentification sécurisée (Login/signup)
- Vérification par **OTP** (valable 1 minute)
- Gestion des comptes bancaires
- Visualisation de cartes bancaires
- Gestion des opérations bancaires
- Gestion du profil et des paramètres
- Liste des contacts

## 🔐 Authentification

### 1. Page de Login

L'utilisateur peut se connecter s'il possède déjà un compte :

- Champs requis : `username` et `password`
- Le mot de passe doit contenir :
  - 8 caractères minimum
  - 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial

👉 Sinon, il peut cliquer sur **Sign Up** pour créer un compte.

### 2. Page de Sign Up

L'utilisateur doit renseigner les informations suivantes :

- `Username`
- `Full name`
- `Email`
- `Password`
- `Confirm Password`
- `Téléphone`

📧 Un **OTP (One-Time Password)** est envoyé à l’adresse e-mail (pensez à vérifier le dossier spam).

### 3. Vérification OTP

- Le code OTP doit être saisi dans un délai de **1 minute**
- Une fois validé, l'utilisateur est redirigé automatiquement vers la page **Login**

## Gestion de comptes bancaires
Par défaut un utilisateur est crée avec un compte bancaire.
Il a ensuite la possibilité de créer des cartes bancaires, d'éffectuer des opérations de debit (withdraw), creditation (Top Up), de transfert

## 🎨 Screenshots
| Login | Signup | OTP Verification |
|-------|--------|------------------|
| ![Login](/frontend/Banking/Readme/login.jpeg) | ![Signup](/frontend/Banking/Readme/signup.jpeg) | ![OTP](/frontend/Banking/Readme/token.jpg) |

| Home | Settings | Settings-Logout |
|-------|--------|------------------|
| ![Login](/frontend/Banking/Readme/home.jpg) | ![Signup](/frontend/Banking/Readme/settings.jpg) | ![OTP](/frontend/Banking/Readme/logout.jpg) |


| Cards | Cards creation | card infos |
|-------|--------|------------------|
| ![Login](/frontend/Banking/Readme/card.jpg) | ![Signup](/frontend/Banking/Readme/card222.jpg) | ![OTP](/frontend/Banking/Readme/card3.jpg) |

| History | Detail of some transaction |
|-------|--------|
| ![Login](/frontend/Banking/Readme/history1.jpg) | ![Signup](/frontend/Banking/Readme/history2.jpg) |

| Contact | Contact detail |
|-------|--------|
| ![Login](/frontend/Banking/Readme/contact.jpg) | ![Signup](/frontend/Banking/Readme/contact2.jpg) |


## Déploiement

* **Backend**: Déployé sur Render

## Architecture du projet 

* **Backend**
![architecture backend](/frontend/Banking/backend-1.png)

* **Frontend**
![alt text](/frontend/Banking/frontend-1-1.png) ![alt text](/frontend/Banking/frontend-2-1.png)

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