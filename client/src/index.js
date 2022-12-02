import React from 'react';
import './index.css';
import App from './App';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Auth from './Auth';
import Privacy from './Privacy';
import './i18nextInit.js';
import NotFound from './NotFound';
import Pay from './Pay';
import Redirect from 'react-router-dom/es/Redirect';

ReactDOM.render(<React.StrictMode>
	<Router>
		<Switch>
		<Route exact path={['/client', '/']} component={App} />
		<Route exact path='/auth' component={Auth} />
		<Route exact path='/privacy' component={Privacy} />
          <Route exact path='/pay' component={Pay} />
		<Route path='/404' component={NotFound} />
		<Redirect from='*' to='/404' />
		</Switch>
	</Router>
</React.StrictMode>, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
