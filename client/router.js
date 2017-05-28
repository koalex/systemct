/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
 /* 
   ================================
   ===       REACT ROUTING     ====
   ================================ 
*/

'use strict';

import React, { Component }                                 from 'react';
import PropTypes                                            from 'prop-types';
import { BrowserRouter as Router, Route, Switch, Redirect, withRouter } from 'react-router-dom';
import { connect }                                          from 'react-redux';
import lightBaseTheme                                       from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme                                          from 'material-ui/styles/getMuiTheme';
import CircularProgress                                     from 'material-ui/CircularProgress';

import App                                                  from './App';
import Signin                                               from './components/signin/Signin';
import Users                                                from './containers/Users';
import Dictionaries                                         from './containers/Dictionaries';
import { authCheck }                                        from './actions';

import io                                                   from 'socket.io-client/socket.io.min.js';
const socketPublic  = io.connect('/', { 'transports': ['websocket'] });
let socketAPI;

function connectToSocketAPI () {
    if (socketAPI && socketAPI.connected) return socketAPI;

    socketAPI = io.connect('/api', { query: { access_token: window.localStorage.getItem('access_token') }, 'transports': ['websocket'] });

    return socketAPI;
}
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup'


// @withRouter
@connect(state => ({ common: state.common }), { authCheck })
export default class Routes extends Component {
    constructor (...props) {
        super(...props);
    }

    static childContextTypes = { muiTheme: PropTypes.object.isRequired };

    static propTypes = {
        common: PropTypes.object,
        authCheck: PropTypes.func
    };

    componentWillMount () { this.props.authCheck(); }

    getChildContext = () => ({ muiTheme: getMuiTheme(lightBaseTheme) });

    render () {
        if (this.props.common.bootstrap) { // FIXME: auth init is LOADING
            return <CircularProgress
                style={{ position: 'fixed', top: 'calc(50% - 100px)', left: 'calc(50% - 100px)' }}
                size={ 200 } thickness={ 5 }>
            </CircularProgress>
        }
        return (
            <Router>
                <div style={{ height: '100%' }}>
                    <Route
                        path='/'
                        render={ props => this.props.common.isAuthenticated ?
                            <App {...props} socket={ connectToSocketAPI() }>

                                <CSSTransitionGroup
                                    transitionName="fade"
                                    transitionAppear={ true }
                                    transitionAppearTimeout={ 300 }
                                    transitionEnterTimeout={ 300 }
                                    transitionLeaveTimeout={ 250 }
                                >
                                    <Route key={ props.location.key + 1 } path="/dictionaries"  render={ props => <Dictionaries {...props} socket={ connectToSocketAPI() }></Dictionaries> }/>
                                    <Route key={ props.location.key + 2 } path="/users"  render={ props => <Users {...props} socket={ connectToSocketAPI() }></Users> }/>
                                    <Route key={ props.location.key + 3 } path="/charts"  render={ props => <img src="http://st.depositphotos.com/1010338/2980/v/950/depositphotos_29806589-stock-illustration-infographics-vector-flat-design-financial.jpg"
                                                                                                                 alt=""/> }/>
                                </CSSTransitionGroup>

                            </App> : <Redirect to={{
                            pathname: '/signin',
                            state: { from: props.location }
                        }}/> }>
                    </Route>
                    <Route path='/signin'
                           render={ props => this.props.common.isAuthenticated ? <Redirect to={{
                               pathname: '/',
                               state: { from: props.location }
                           }}/> : <Signin {...props} socket={ socketPublic }></Signin> }>
                    </Route>
                </div>
            </Router>
        )
    }
}
