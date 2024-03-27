import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import 'mapbox-gl/dist/mapbox-gl.css';

const theme = createTheme({
    palette: {
        primary: {
            main: '#000000'
        }
    },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode>
    <ThemeProvider theme={theme}>
        <App/>
    </ThemeProvider>
</React.StrictMode>);