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

