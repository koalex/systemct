/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
/*
 ================================
 ===       MODULE NAME       ====
 ================================
 */

'use strict';

import styles from './signup.styl';

import React, { Component, PropTypes } from 'react';
// import injectTapEventPlugin from 'react-tap-event-plugin';
import LinearProgress from 'material-ui/LinearProgress';
import Snackbar from 'material-ui/Snackbar';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import io from 'socket.io-client/socket.io.min.js';
const socket = io.connect('/api', { query: { access_token: window.localStorage.getItem('access_token') }, 'transports': ['websocket'] });

export default class Signup extends Component {
    constructor (props) { // props
        super(props);
        // injectTapEventPlugin();
        this.state = {
            isLoading: false,
            errEmail: null,
            errPassword: null,
            snackbar: false
        };
    }

    static defaultProps = {};

    static propTypes = {};

    getChildContext () {
        return {
            muiTheme: getMuiTheme(lightBaseTheme)
        };
    }

    handleSubmit = e => {
        const self = this;

        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        this.setState({ isLoading: true, errEmail: null, errPassword: null });

        if (socket.connected) socket.emit('signup', { email: self.state.email, password: self.state.password });
    };

    handleInputChange = e => {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({ [name]: value, snackbar: false, errEmail: null, errPassword: null });
    };

    componentDidMount () {
        const self = this;
        socket.on('signup', data => {
            // window.localStorage.setItem('user', JSON.stringify({ _id: data.user_id }));
            self.setState({ isLoading: false });
            // socket.removeListener("news", cbProxy);
            // socket.removeAllListeners("news");
        });

        socket.on('err', errData => {
            this.setState({ isLoading: false });

            if (errData.field === 'email') {
                this.setState({ errEmail: errData.message });
                return;
            }
            if (errData.field === 'password') {
                this.setState({ errPassword: errData.message });
                return;
            }
            this.setState({ snackbar: errData.message });
        });
    }

    render () {
        let Progress = this.state.isLoading ? <LinearProgress className={styles.progress}></LinearProgress> : null;
        return (
            <div className={styles.container}>
                {Progress}
                <h1>SIGNUP</h1>
                <br/>
                <form className={styles.signupForm} >
                    <input type="hidden" autoFocus disabled={this.state.isLoading}/>
                    <TextField
                        value={this.state.email}
                        name="email"
                        hintText="Введите email"
                        disabled={this.state.isLoading}
                        floatingLabelText="Email"
                        errorText={this.state.errEmail}
                        onChange={this.handleInputChange}
                    />
                    <br/>
                    <TextField
                        value={this.state.password}
                        name="password"
                        disabled={this.state.isLoading}
                        hintText="Введите пароль"
                        floatingLabelText="Пароль"
                        errorText={this.state.errPassword}
                        onChange={this.handleInputChange}
                    />
                    <br/>
                    <TextField
                        value={this.state.password}
                        name="passwordConfirmation"
                        disabled={this.state.isLoading}
                        hintText="Повторите пароль"
                        floatingLabelText="Веедите пароль ещё раз..."
                        errorText={this.state.errPassword}
                        onChange={this.handleInputChange}
                    />
                    <br/>
                    <FlatButton disabled={this.state.isLoading}
                                fullWidth={true}
                                label="Создать"
                                primary={true}
                                onClick={ this.handleSubmit }
                                type="submit"
                    />
                </form>
                <Snackbar
                    open={this.state.snackbar}
                    message={this.state.snackbar}
                    autoHideDuration={2000}
                />
            </div>
        )
    }
}

Signup.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};