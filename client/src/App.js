import './App.css';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
    TextField,
    Tooltip,
    Typography
} from '@mui/material'
import {FileDownload, Search} from '@mui/icons-material'
import {useEffect, useRef, useState} from 'react'
import mapboxgl from 'mapbox-gl'
import capitalize from 'capitalize'

function App() {

    mapboxgl.accessToken = "pk.eyJ1IjoieTRhbml2IiwiYSI6ImNsZG00eDF1MDA2MDUzbm14b3c4NjllbDYifQ.uShfpnb1m9U476IMgE8Neg"
    var BASE_API_URL = 'https://eduquery-api.onrender.com/api'

    var [filters, setFilters] = useState({
        city: [], type: [], status: []
    })

    var [searchParams, setSearchParams] = useState({
        name: '', city: '', type: "all", status: "all"
    })

    var [autocompleteNoOptionsText, setAutocompleteNoOptionsText] = useState('Aucun résultat trouvé')
    var [searchResults, setSearchResults] = useState()
    var [isFetching, setIsFetching] = useState(false)

    var map = useRef()
    var mapContainer = useRef()

    function getFilters() {
        fetch(BASE_API_URL + '/filters')
            .then(response => response.json())
            .then(data => {
                setFilters({
                    city: data.cities, type: data.types, status: data.status
                })
            })

    }

    function initMap() {
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/light-v11',
            center: [2.3522, 48.8566],
            zoom: 0
        })
    }

    async function getJSON(page) {
        const req = await fetch(BASE_API_URL + `/search?query=${searchParams.name}&city=${searchParams.city}&type=${searchParams.type}&status=${searchParams.status}&page=${page}&format=json`)
        const data = await req.json()
        setSearchResults(data)
        return data
    }

    function resetMap() {
        if (map.current.getLayer('clusters')) map.current.removeLayer('clusters')
        if (map.current.getLayer('unclustered-point')) map.current.removeLayer('unclustered-point')
        if (map.current.getSource('etablissements')) map.current.removeSource('etablissements')
    }

    function displayGeoJSON() {
        fetch(BASE_API_URL + `/search?query=${searchParams.name}&city=${searchParams.city}&type=${searchParams.type}&status=${searchParams.status}&format=geojson`)
            .then(response => response.json())
            .then(data => {
                resetMap()
                map.current.addSource('etablissements', {
                    type: 'geojson', data: data, cluster: true, clusterMaxZoom: 14, clusterRadius: 50
                })

                map.current.addLayer({
                    id: 'clusters', type: 'circle', source: 'etablissements', filter: ['has', 'point_count'], paint: {
                        'circle-color': ['step', ['get', 'point_count'], '#000000', 100, '#5e0000', 750, '#e10000'],
                        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
                    }
                })

                map.current.addLayer({
                    id: 'unclustered-point',
                    type: 'circle',
                    source: 'etablissements',
                    filter: ['!', ['has', 'point_count']],
                    paint: {
                        'circle-color': '#000000',
                        'circle-radius': 6,
                        'circle-stroke-width': 1,
                        'circle-stroke-color': '#fff'
                    }
                })

                if (data.features.length > 1) {
                    var bounds = new mapboxgl.LngLatBounds()
                    data.features.forEach(function (feature) {
                        bounds.extend(feature.geometry.coordinates)
                    })
                    map.current.fitBounds(bounds, {
                        padding: 50
                    })
                } else {
                    map.current.flyTo({
                        center: data.features[0].geometry.coordinates, zoom: 18
                    })
                }
            })
    }

    async function initSearch() {
        setIsFetching(true)
        const responseData = await getJSON(1)
        setIsFetching(false)
        if (responseData.total > 0) {
            displayGeoJSON()
        } else {
            map.current.flyTo({
                center: [2.3522, 48.8566], zoom: 0.5
            })
            resetMap()
        }
    }

    useEffect(() => {
        getFilters()
        initMap()
        map.current.on('style.load', async () => {
            await initSearch()
        })
    }, [])

    return (<>
        <div className="App">
            <div className="App-SearchContainer">
                <Typography variant="h4" gutterBottom>Rechercher un établissement scolaire</Typography>
                <div className='App-SearchContainer-Params'>
                    <TextField label="Nom de l'établissement scolaire" variant="filled" fullWidth
                               onChange={(e) => setSearchParams({...searchParams, name: e.target.value})}/>
                    <div className="App-SearchContainer-Params-Filters">
                        <Autocomplete
                            options={filters.city}
                            forcePopupIcon={false}
                            renderInput={(params) => <TextField {...params} label="Ville" variant="filled"/>}
                            filterOptions={(options, params) => {
                                if (params.inputValue.length < 3) {
                                    setAutocompleteNoOptionsText('Veuillez entrer au moins 3 caractères')
                                    return []
                                } else {
                                    setAutocompleteNoOptionsText(`Aucun résultat trouvé pour "${params.inputValue}"`)
                                    return options.filter(option => option.toLowerCase().includes(params.inputValue.toLowerCase()))
                                }
                            }}
                            noOptionsText={autocompleteNoOptionsText}
                            onChange={(e, value) => setSearchParams({...searchParams, city: value})}
                        />
                        <FormControl variant="filled">
                            <InputLabel id="type">Type d'établissement</InputLabel>
                            <Select labelId="type" label="Type" defaultValue="all" fullWidth
                                    onChange={(e) => setSearchParams({...searchParams, type: e.target.value})}>
                                <MenuItem value="all">Tous</MenuItem>
                                {filters.type.map((type) => <MenuItem value={type}>{type}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl variant="filled">
                            <InputLabel id="status">Statut de l'établissement</InputLabel>
                            <Select labelId="status" label="Statut" defaultValue="all" fullWidth
                                    onChange={(e) => setSearchParams({...searchParams, status: e.target.value})}>
                                <MenuItem value="all">Tous</MenuItem>
                                {filters.status.map((status) => <MenuItem value={status}>{status}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </div>
                </div>
                <Button variant="contained" fullWidth size='large' startIcon={<Search/>} disableElevation
                        onClick={initSearch}>Rechercher</Button>
            </div>
            <div className="App-ResultsContainer">
                <div className="App-ResultsContainer-Results">
                    {isFetching ? (<Alert severity="info">Recherche en
                        cours...</Alert>) : searchResults ? (searchResults.total > 0 ? (<>
                        <div className="App-ResultsContainer-Results-Total">
                            <Alert severity="success" className="App-ResultsContainer-Results-Total-Count">Résultats
                                trouvés: {searchResults.total}</Alert>
                            <Button startIcon={<FileDownload/>}
                                    className="App-ResultsContainer-Results-Total-Download"
                                    href={BASE_API_URL + `/search?query=${searchParams.name}&city=${searchParams.city}&type=${searchParams.type}&status=${searchParams.status}&format=csv`}>Télécharger
                                les résultats au format CSV</Button>
                        </div>
                        {searchResults.results.map((result) => (
                            <Card className="App-ResultsContainer-Results-List-Item" onClick={() => {
                                if (result.longitude != "N/A" && result.latitude != "N/A") {
                                    if (window.innerWidth < 900) {
                                        document.querySelector('.App-ResultsContainer-Map').scrollIntoView({behavior: 'smooth'})
                                    }
                                    map.current.flyTo({
                                        center: [result.longitude, result.latitude], zoom: 18
                                    })
                                }
                            }} key={result.uai}>
                                <CardMedia component="img" height="140"
                                           image={BASE_API_URL + `/streetview?uai=${result.uai}`}
                                           alt={result.name}
                                           className="App-ResultsContainer-Results-List-Item-Image"
                                           loading="lazy"/>
                                <CardContent className="App-ResultsContainer-Results-List-Item-Content">
                                    <Typography gutterBottom variant="h5"
                                                component="div">{capitalize.words(result.name)}</Typography>
                                    <div className="App-ResultsContainer-Results-List-Item-Chips">
                                        <Chip label={result.type}/>
                                        <Chip label={result.status}/>
                                        {result.students != "N/A" ? (
                                            <Chip label={`${result.students} élèves`}/>) : null}
                                        {result.missing_data.length > 0 ? (<Tooltip
                                            title={`Données manquantes: ${result.missing_data.join(', ')}`}>
                                            <Chip label="Données manquantes" color="warning"/>
                                        </Tooltip>) : null}
                                    </div>
                                    {result.latitude != "N/A" && result.longitude != "N/A" ? (<a target="_blank"
                                                                                                 href={`https://www.openstreetmap.org/note/new?lat=${result.latitude}&lon=${result.longitude}#map=19/${result.latitude}/${result.longitude}`}>
                                        <Typography variant="body2"
                                                    color="text.secondary">{capitalize.words(`${result.address}, ${result.postal_code} ${result.city}`)}</Typography>
                                    </a>) : (<Typography variant="body2"
                                                         color="text.secondary">{capitalize.words(`${result.address}, ${result.postal_code} ${result.city}`)}</Typography>)}
                                    <Typography variant="body2" color="text.secondary">Académie
                                        de {result.academy}</Typography>
                                </CardContent>
                            </Card>))}
                        {searchResults.results.length > 0 ? (
                            <Pagination count={searchResults.pages} page={searchResults.page}
                                        className="App-ResultsContainer-Results-Pagination"
                                        onChange={(e, page) => {
                                            getJSON(page)
                                            document.querySelector('.App-ResultsContainer').scrollIntoView({behavior: 'smooth'})
                                        }}/>) : null}
                    </>) : (<Alert severity="warning">Aucun résultat trouvé</Alert>)) : null}
                </div>
                <div className="App-ResultsContainer-Map" ref={mapContainer}></div>
            </div>
        </div>
    </>);
}

export default App;
