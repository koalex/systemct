'use strict';

const isServer = () => !(typeof window !== 'undefined' && window.document);

import React 							 from 'react';
import ReactDOM 						 from 'react-dom';
import { Provider } 					 from 'react-redux';
import { AppContainer } 				 from 'react-hot-loader';
import Router 							 from './router';
import store 							 from './store'
import injectTapEventPlugin              from 'react-tap-event-plugin';

let DevTools;

if (__DEVELOPMENT__) DevTools = require('./DevTools').default;

injectTapEventPlugin();

const render = Component => {
  ReactDOM.render(
	  	<AppContainer>
			<Provider store={ store } key="provider">
				<div style={{ height: '100%' }}>
					<Component></Component>
					{ DevTools ? <DevTools></DevTools> : null }
				</div>
			</Provider>
		</AppContainer>
    ,
    document.getElementById('root')
  )
};

render(Router);

if (module && module.hot) module.hot.accept('./router', () => { render(Router); });