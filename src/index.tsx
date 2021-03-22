import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AppSampleMedium from './AppSampleMedium/AppSampleMedium';
import reportWebVitals from './reportWebVitals';
import AppSampleSimple from "./AppSampleSimple/AppSampleSimple";


//Modify this function to change the example application
ReactDOM.render(
  <React.StrictMode>
    <AppSampleMedium />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
