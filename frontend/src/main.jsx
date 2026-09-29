import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Provider } from 'react-redux';
import { store } from './store/store';


ReactDOM.createRoot(document.getElementById('root')).render(
	  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
		<BrowserRouter>
			<Provider store={store}>
				<App />
			</Provider>
		</BrowserRouter>
	  </GoogleOAuthProvider>
);
