import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from "react-redux";
import App from './App';
import store from './store';

import './index.css';

// fonts
import '@fontsource/open-sans/300.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/500.css';
import '@fontsource/open-sans/700.css';

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
