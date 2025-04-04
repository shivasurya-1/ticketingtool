import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import store from './store/store.js';
import App from './App.jsx';
import { BrowserRouter as Router } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root');

const root = createRoot(container);
root.render(
  <Provider store={store}>
    <Router>

      <App />

    </Router>
  </Provider>
);

reportWebVitals();