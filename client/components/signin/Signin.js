/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/

/*
 ================================
 ===       MODULE NAME       ====
 ================================
 */

'use strict';

import styles from './signin.styl';

import React, { Component }     from 'react';
import PropTypes                from 'prop-types';
import logo                     from '../../assets/img/logo.svg';
import LinearProgress           from 'material-ui/LinearProgress';
import Snackbar                 from 'material-ui/Snackbar';
import FlatButton               from 'material-ui/FlatButton';
import TextField                from 'material-ui/TextField';

import { connect } from 'react-redux';
import { signinSubmit, inputChange, dispatch } from '../../actions';
import { AUTH, SIGNIN, _SUCCESS, _ERROR, _CLEAR } from '../../actions/constants';


class Signin extends Component {
    constructor (...props) {
        super(...props);
        this.state = {}
    }

    static defaultProps = {};

    static propTypes = {
        socket: PropTypes.object,
        signin: PropTypes.object,
        signinSubmit: PropTypes.func,
        inputChange: PropTypes.func,
        dispatch: PropTypes.func
    };

    submit = ev => {
        ev.preventDefault();
        ev.stopPropagation();
        ev.nativeEvent.stopImmediatePropagation();
        let credentials = { email: this.refs.emailInput.input.value, password: this.refs.passwordInput.input.value };
        this.props.signinSubmit(credentials);
    };

    componentDidMount () {
        // ReactDOM.findDOMNode - нужен для поиска дом в реакктовской компоненте, например <Article ref="test2">
        // ReactDOM.findDOMNode(this.refs.test2);

    }

    componentWillUnmount () {
        // if (this.props.socket) {
        //     this.props.socket.removeAllListeners(AUTH + SIGNIN + _SUCCESS);
        //     this.props.socket.removeAllListeners(AUTH + SIGNIN + _ERROR);
        //     /*this.props.socket.close();*/
        // }

    }

    // componentWillReceiveProps (props) {}

    // shouldComponentUpdate (nextProps, nextState) { return true; }

    inputChange = (data) => {
        let needToClearErrors = this.props.auth.error || Object.keys(this.props.auth.errors).length;

        if (needToClearErrors) this.props.dispatch({ type: _ERROR + _CLEAR });

        this.props.inputChange(data)
    };

    render () {
        const { auth } = this.props;
        let Progress = auth.isLoading ? <LinearProgress className={ styles.progress }></LinearProgress> : null;

        return (
            <div className={ styles.container }>
                { Progress }
                <img src={ logo } className={ styles.logo } alt="Системы постоянного тока"/>
                <br/>
                <br/>
                <form className={ styles.signinForm } >
                    <input type="hidden" autoFocus disabled={ auth.isLoading }/>
                    <div className={ styles.inputContainer }>
                        <TextField
                            defaultValue={ auth.email }
                            name="email"
                            ref="emailInput"
                            onBlur={ () => { this.inputChange({ email: this.refs.emailInput.input.value }); } }
                            hintText="Введите ваш email"
                            disabled={ auth.isLoading }
                            floatingLabelText="Email"
                            errorText={ auth.errors.email }
                        />
                    </div>
                    <div className={ styles.inputContainer }>
                        <TextField
                            type="password"
                            defaultValue={ auth.password }
                            name="password"
                            ref="passwordInput"
                            onBlur={ () => { this.inputChange({ password: this.refs.passwordInput.input.value }); } }
                            disabled={ auth.isLoading }
                            hintText="Введите пароль"
                            floatingLabelText="Пароль"
                            errorText={ auth.errors.password }
                        />
                    </div>
                    <FlatButton disabled={ auth.isLoading }
                                fullWidth={ true }
                                label="Войти"
                                primary={ true }
                                onClick={ this.submit }
                                type="submit"
                    />
                </form>
                <Snackbar
                    open={ Boolean(auth.error) }
                    message={ auth.error || '' }
                    autoHideDuration={ 2000 }
                />
            </div>
        )
    }
}

export default connect(state => {
    const { auth } = state;
    return { auth };
}, { signinSubmit, inputChange, dispatch })(Signin)