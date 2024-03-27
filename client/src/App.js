import './App.css';
import {Autocomplete, Button, FormControl, InputLabel, MenuItem, Select, TextField} from '@mui/material'
import {Search} from '@mui/icons-material'

function App() {
  return (
    <>
      <div className="App">
        <div className="App-SearchContainer">
          <h1>Rechercher un établissement scolaire</h1>
          <div className='App-SearchContainer-Params'>
            <TextField label="Nom de l'établissement scolaire" variant="filled" fullWidth />
            <div className="App-SearchContainer-Params-Filters">
              <Autocomplete options={['Paris', 'Lyon', 'Marseille']}  forcePopupIcon={false} renderInput={(params) => <TextField {...params} label="Ville" variant="filled" />} />
              <FormControl variant="filled">
                <InputLabel id="type">Type d'établissement</InputLabel>
                <Select labelId="type" label="Type" defaultValue="all" fullWidth>
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="école">École</MenuItem>
                  <MenuItem value="collège">Collège</MenuItem>
                  <MenuItem value="lycée">Lycée</MenuItem>
                </Select>
              </FormControl>
              <FormControl variant="filled">
                <InputLabel id="status">Statut de l'établissement</InputLabel>
                <Select labelId="status" label="Statut" defaultValue="all" fullWidth>
                  <MenuItem value="all">Tous</MenuItem>
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="privé">Privé</MenuItem>
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
