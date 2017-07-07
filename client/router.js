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
// import Dictionaries                                          from './containers/Dictionaries';
import UGO                                                      from './components/dictionaries/UGO';
import Sensors                                                  from './components/dictionaries/Sensors';
import Devices                                                  from './components/dictionaries/Devices';
import Projects                                                 from './components/dictionaries/Projects';
import { authCheck/*, dictionaryCreate, dictionaryRead*/ }      from './actions';

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
@connect(state => ({ common: state.common }), { authCheck/*, dictionaryCreate*/ })
export default class Routes extends Component {
    constructor (...props) {
        super(...props);
    }

    static childContextTypes = { muiTheme: PropTypes.object.isRequired };

    static propTypes = {
        common: PropTypes.object,
        authCheck: PropTypes.func,
        // dictionaryCreate: PropTypes.func
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
                        render={ props => true ?
                            <App {...props} socket={ connectToSocketAPI() }>

                                <CSSTransitionGroup
                                    transitionName="fade"
                                    transitionAppear={ true }
                                    transitionAppearTimeout={ 300 }
                                    transitionEnterTimeout={ 300 }
                                    transitionLeaveTimeout={ 250 }
                                >

                                    <Route key={ props.location.key + 11 } path="/dictionaries/ugo"  render={ props => <UGO socket={ connectToSocketAPI() } {...props}></UGO> }/>
                                    <Route key={ props.location.key + 3 } path="/dictionaries/sensors"  render={ props => <Sensors socket={ connectToSocketAPI() } {...props}></Sensors> }/>
                                    <Route key={ props.location.key + 4 } path="/dictionaries/devices"  render={ props => <Devices socket={ connectToSocketAPI() } {...props}></Devices> }/>
                                    <Route key={ props.location.key + 4856 } path="/dictionaries/projects"  render={ props => <Projects socket={ connectToSocketAPI() } {...props}></Projects> }/>
                                    <Route key={ props.location.key + 5 } path="/users"  render={ props => <Users {...props} socket={ connectToSocketAPI() }></Users> }/>
                                    <Route key={ props.location.key + 6 } path="/charts"  render={ props => <img style={{ width: '100%' }} src="https://image.shutterstock.com/z/stock-vector-flat-design-infographic-elements-charts-graphs-symbols-vector-eps-176674124.jpg" alt=""/> }/>
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
