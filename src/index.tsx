import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AppSampleMedium from './AppSampleMedium/AppSampleMedium';
import AppSampleSimple from "./AppSampleSimple/AppSampleSimple";
import AppSampleHard from "./AppSampleHard/AppSampleHard";
import reportWebVitals from './reportWebVitals';



//Modify this function to change the example application
ReactDOM.render(
  <React.StrictMode>
    <AppSampleHard />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
