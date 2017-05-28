'use strict';

import { createStore, compose, applyMiddleware }    from 'redux';
import reducer                                      from '../reducers';
import api                                          from '../middlewares/api';

let DevTools;

const middlewares = [];
      middlewares.push(applyMiddleware(api, /* mw */));

if (__DEVELOPMENT__) {
    DevTools = require('../DevTools').default;
    middlewares.push(DevTools.instrument());
}

const enhancer  = compose(...middlewares);
const store     = createStore(reducer, {/*initialState*/}, enhancer);

if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
        const nextRootReducer = require('../reducers/index').default;
        store.replaceReducer(nextRootReducer);
    });
}

if (__DEVELOPMENT__) window.store = store;

export default store

// store.dispatch({ type: EVENT_NAME });
