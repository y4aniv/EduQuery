import './App.css';
import {Autocomplete, Button, FormControl, InputLabel, MenuItem, Select, TextField} from '@mui/material'
import {Search} from '@mui/icons-material'
import {useEffect, useState} from 'react'

function App() {

  var BASE_API_URL = 'https://eduquery-api.onrender.com/api'

  var [filters, setFilters] = useState({
    city: [],
    type: [],
    status: []
  })

  var [autocompleteNoOptionsText, setAutocompleteNoOptionsText] = useState('Aucun résultat trouvé')

  function getFilters() {
    fetch(BASE_API_URL + '/filters')
    .then(response => response.json())
    .then(data => {
      setFilters({
        city: data.cities,
        type: data.types,
        status: data.status
      })
    })
  
  }

  useEffect(()=>{
    getFilters()
  }, [])

  return (
    <>
      <div className="App">
        <div className="App-SearchContainer">
          <h1>Rechercher un établissement scolaire</h1>
          <div className='App-SearchContainer-Params'>
            <TextField label="Nom de l'établissement scolaire" variant="filled" fullWidth />
            <div className="App-SearchContainer-Params-Filters">
              <Autocomplete 
                options={filters.city} 
                forcePopupIcon={false} 
                renderInput={(params) => <TextField {...params} label="Ville" variant="filled" />} 
                filterOptions={(options, params) => {
                  if (params.inputValue.length < 3) {
                    setAutocompleteNoOptionsText('Veuillez entrer au moins 3 caractères')
                    return []
                  }else{
                    setAutocompleteNoOptionsText(`Aucun résultat trouvé pour "${params.inputValue}"`)
                    return options.filter(option => option.toLowerCase().includes(params.inputValue.toLowerCase()))
                  }
                }}
                noOptionsText={autocompleteNoOptionsText}
                />
              <FormControl variant="filled">
                <InputLabel id="type">Type d'établissement</InputLabel>
                <Select labelId="type" label="Type" defaultValue="all" fullWidth>
                  <MenuItem value="all">Tous</MenuItem>
                  {filters.type.map((type) => <MenuItem value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl variant="filled">
                <InputLabel id="status">Statut de l'établissement</InputLabel>
                <Select labelId="status" label="Statut" defaultValue="all" fullWidth>
                  <MenuItem value="all">Tous</MenuItem>
                  {filters.status.map((status) => <MenuItem value={status}>{status}</MenuItem>)}
                </Select>
              </FormControl>
            </div>
          </div>
          <Button variant="contained" fullWidth size='large' startIcon={<Search />} disableElevation>Rechercher</Button>
        </div>
      </div>
    </>
  );
}

export default App;
