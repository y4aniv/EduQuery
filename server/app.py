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

# Définir les routes de l'API REST
@app.get("/api/filters")  # Route GET "/api/filters"
def get_filters():
    """
    Récupérer les filtres de recherche.
    :return: Les filtres de recherche (dict)
    """
    return fl.jsonify( {  # Retourner les filtres de recherche sous forme de JSON (HTTP 200 OK)
        "cities": list(set([entry["nom_commune"] for entry in dataset])),  # Récupérer les villes uniques dans le dataset
        "types": list(set([entry["type_etablissement"] for entry in dataset])),  # Récupérer les types uniques dans le dataset
        "status": list(set([entry["statut_public_prive"] for entry in dataset])),  # Récupérer les statuts uniques dans le dataset
    })


@app.get("/api/search")  # Route GET "/api/search"
def get_search():
    """
    Récupérer les résultats de recherche.
    :param(req) query: Le nom de l'établissement (str). Par défaut, "".
    :param(req) city: Le nom de la ville (str). Par défaut, "".
    :param(req) type: Le type de l'établissement (str). Par défaut, "".
    :param(req) status: Le statut de l'établissement (str). Par défaut, "all".
    :param(req) page: Le numéro de la page (int). Par défaut, 1.
    :param(req) format: Le format de la réponse (str). Par défaut, "json".
    :return:
    """

    # Récupérer les paramètres de la requête et définir les valeurs par défaut
    query = fl.request.args.get("query", default="")  # Récupérer le nom de l'établissement
    city = fl.request.args.get("city", default="")  # Récupérer le nom de la ville
    type = fl.request.args.get("type", default="all")  # Récupérer le type de l'établissement (école, collège, lycée
    status = fl.request.args.get("status", default="all")  # Récupérer le statut de l'établissement (public, privé)
    page = int(fl.request.args.get("page", default=1))  # Récupérer le numéro de la page
    format = fl.request.args.get("format", default="json")  # Récupérer le format de la réponse (json, geojson, csv)
    max_page = 15  # Définir le nombre maximum de résultats par page

    # Filtrer les données en fonction des paramètres de la requête
    results = dataset  # Initialiser les résultats avec le dataset
    if query != "":  # Si le paramètre de recherche n'est pas vide
        results = [entry for entry in results if query.lower() in entry["nom_etablissement"].lower().replace("-", " ")]  # Chercher le nom de l'établissement en étant insensible à la casse et aux tirets
    if city != "":  # Si le paramètre de ville n'est pas vide
        results = [entry for entry in results if city.lower() == entry["nom_commune"].lower()]  # Filtrer les résultats par ville
    if type != "all":  # Si le paramètre de type n'est pas "all"
        results = [entry for entry in results if type.lower() == entry["type_etablissement"].lower()]  # Filtrer les résultats par type
    if status != "all":  # Si le paramètre de statut n'est pas "all"
        results = [entry for entry in results if status.lower() == entry["statut_public_prive"].lower()]  # Filtrer les résultats par statut

    # Calculer les informations de pagination
    total_results = len(results)  # Calculer le nombre total de résultats
    total_pages = (total_results + max_page - 1) // max_page  # Calculer le nombre total de pages

    # Retourner les résultats en fonction du format de la réponse
    if format == "json":  # Si le format de la réponse est JSON
        results = results[(page - 1) * max_page:page * max_page]  # Récupérer les résultats de la page actuelle

        json = {  # Créer un objet JSON avec les résultats
            "total": total_results,  # Nombre total de résultats
            "page": page,  # Numéro de la page actuelle
            "pages": total_pages,  # Nombre total de pages
            "results": []  # Résultats de la page actuelle
        }

        for result in results:  # Pour chaque résultat
            missing_data = [  # Récupérer les données manquantes
                key for key,  # Pour chaque clé et valeur dans le résultat
                value in result.items()  if value == "N/A" and key in [  # Si la valeur est "N/A" et la clé est dans la liste des clés
                    "uai", # Clé de l'UAI
                    "nom_etablissement",  # Clé du nom de l'établissement
                    "type_etablissement",  # Clé du type de l'établissement
                    "statut_public_prive",  # Clé du statut de l'établissement
                    "nom_commune",  # Clé du nom de la commune
                    "adresse_1",  # Clé de l'adresse
                    "code_postal",  # Clé du code postal
                    "libelle_academie",  # Clé de l'académie
                    "nombre_d_eleves",  # Clé du nombre d'élèves
                    "longitude",  # Clé de la longitude
                    "latitude"  # Clé de la latitude
                ]
            ]

            json["results"].append({  # Ajouter les informations du résultat à l'objet JSON
                "uai": result["identifiant_de_l_etablissement"],  # UAI de l'établissement
                "name": result["nom_etablissement"],  # Nom de l'établissement
                "type": result["type_etablissement"],  # Type de l'établissement
                "status": result["statut_public_prive"],  # Statut de l'établissement
                "city": result["nom_commune"],  # Nom de la commune
                "address": result["adresse_1"],  # Adresse de l'établissement
                "postal_code": result["code_postal"],  # Code postal de la commune
                "academy": result["libelle_academie"],  # Nom de l'académie
                "students": result["nombre_d_eleves"],  # Nombre d'élèves
                "longitude": result["longitude"],  # Longitude de l'établissement
                "latitude": result["latitude"],  # Latitude de l'établissement
                "missing_data": missing_data  # Liste des données manquantes
            })

        return fl.jsonify(json)  # Retourner les résultats au format JSON (HTTP 200 OK)

    elif format == "geojson":
        geojson = {  # Créer un objet GeoJSON avec les résultats
            "type": "FeatureCollection",  # Type de données
            "features": []  # Résultats
        }

        for result in results:  # Pour chaque résultat
            if result["longitude"] != "N/A" and result["latitude"] != "N/A":  # Si les coordonnées sont disponibles
                feature = {  # Créer un objet GeoJSON pour le résultat
                    "type": "Feature",  # Type de données
                    "geometry": {  # Géométrie du résultat
                        "type": "Point",  # Type de géométrie
                        "coordinates": [  # Coordonnées du résultat
                            float(result["longitude"]),  # Longitude du résultat
                            float(result["latitude"])  # Latitude du résultat
                        ]
                    },
                    "properties": {}  # Propriétés du résultat
                }

                geojson["features"].append(feature)  # Ajouter le résultat à l'objet GeoJSON

        return fl.jsonify(geojson)  # Retourner les résultats au format GeoJSON (HTTP 200 OK)

    elif format == "csv":  # Si le format de la réponse est CSV
        csv = pandas.DataFrame(results)[  # Créer un DataFrame Pandas avec les résultats et sélectionner les colonnes
            ["identifiant_de_l_etablissement",  # UAI de l'établissement
             "nom_etablissement",  # Nom de l'établissement
             "type_etablissement",  # Type de l'établissement
             "statut_public_prive",  # Statut de l'établissement
             "nom_commune",  # Nom de la commune
             "adresse_1",  # Adresse de l'établissement
             "code_postal",  # Code postal de la commune
             "libelle_academie",  # Nom de l'académie
             "nombre_d_eleves",  # Nombre d'élèves
             "longitude",  # Longitude de l'établissement
             "latitude"  # Latitude de l'établissement
             ]]
        return fl.Response(csv.to_csv(index=False), mimetype="text/csv")  # Retourner les résultats au format CSV (HTTP 200 OK)
    else:  # Si le format de la réponse n'est pas supporté (JSON, GeoJSON, CSV)
        return {"error": "Unsupported format"}, 400  # Retourner une erreur (HTTP 400 Bad Request)
