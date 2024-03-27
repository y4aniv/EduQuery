<div align="center">
    <h1>EduQuery</h1>
    <h3>Moteur de recherche des établissements scolaires français</h3>
</div>
<br>
## Table des matières
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Utilisation](#utilisation)
4. [Fonctionnalités](#fonctionnalités)
5. [Technologies](#technologies)
6. [Licence](#licence)

## Introduction
**EduQuery** est un moteur de recherche des établissements scolaires français. Il permet de recherche simplement et rapidement dans la base de données des établissements scolaires français. Les données sont issues du site [data.gouv.fr](https://www.data.gouv.fr/fr/datasets/annuaire-de-leducation/).

## Installation
**EduQuery** est composé de deux parties : le serveur et le client.
### Serveur
1. Cloner le dépôt
```bash
git clone https://github.com/y4aniv/EduQuery.git
```
2. Se déplacer dans le dossier du serveur
```bash
cd EduQuery/server
```
3. Installer les dépendances
```bash
pip install -r requirements.txt
```
4. Lancer le serveur
```bash
gunincorn app:app
```
### Client
1. Se déplacer dans le dossier du client
```bash
cd EduQuery/client
```
2. Installer les dépendances
```bash
npm install
```
3. Lancer le client
```bash
npm start
```

## Utilisation
Pour utiliser **EduQuery**, il suffit de se rendre sur [http://localhost:3000](http://localhost:3000) et de commencer à rechercher les établissements scolaires français.
>[!IMPORTANT]
> Il est important de bien définir l'adresse du serveur dans le fichier `client/src/App.js` à la ligne `28`

Une version hébergée est disponible à l'adresse suivante : [https://eduquery.vercel.app/](https://eduquery.vercel.app/). Il est nécessaire de patienter quelques seconde lors de la première recherche pour que le serveur se réveille.

## Fonctionnalités
- Recherche par nom
- Recherche par ville
- Recherche par type d'établissement (école, collège, lycée)
- Recherche par statut (public, privé)
- Téléchargement des résultats de recherche au format CSV
- Affichage des détails d'un établissement
- Affichage des établissements sur une carte
- Récupération des images depuis Google Street View

## Technologies
- [React](https://reactjs.org/)
- [Flask](https://flask.palletsprojects.com/)
- [Material-UI](https://material-ui.com/)
- [MapBox](https://www.mapbox.com/)
- [Pandas](https://pandas.pydata.org/)

## Licence
Ce projet est sous licence MIT. Voir le fichier [LICENCE](LICENCE) pour plus d'informations.
