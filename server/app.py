# Importer les modules nécessaires
import requests  # `requests` permet de faire des requêtes HTTP
import streetview  # `streetview` permet de récupérer des images Street View
import pandas  # `pandas` permet de manipuler des données
import flask as fl  # `flask` permet de créer une API REST
from flask_cors import CORS as fl_cors  # `flask_cors` permet de gérer les CORS
from flask_compress import Compress as fl_compress  # `flask_compress` permet de compresser les réponses

# Configurations de l'instance de Flask
app = fl.Flask(__name__)  # Créer une instance de l'application Flask
fl_cors(app, resources={r"/api/*": {"origins": "*"}})  # Activer les CORS pour l'API REST
fl_compress(app)  # Activer la compression des réponses

# Importer et formater les données du fichier CSV
dataset = (pandas.read_csv("../assets/fr-en-annuaire-education.csv", sep=";")  # Lire le fichier CSV
           .fillna("N/A")  # Remplacer les valeurs manquantes par "N/A"
           .rename(str.lower, axis="columns")  # Mettre les noms des descripteurs en minuscules
           .replace({"type_etablissement": {"Ecole": "École"}})  # Remplacer "Ecole" par "École"
           .to_dict(orient="records"))  # Convertir les données en liste de dictionnaires
