'use strict';

import styles from './styles.styl';

import React, { Component }     from 'react';
import PropTypes                from 'prop-types';
import Dialog                   from 'material-ui/Dialog';
import TextField                from 'material-ui/TextField';
import FlatButton               from 'material-ui/FlatButton';
import IEEE754                  from '../../../libs/IEEE754_client';
import { cyan500, red500 }      from 'material-ui/styles/colors';


export default class RegisterWrite extends Component {
    constructor(...props) {
        super(...props);
        this.state = { error: false, success: false };
    }

    static propTypes = {
        socket: PropTypes.object,
        register: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // register
        dataType: PropTypes.string,
        close: PropTypes.func,
        open: PropTypes.bool,
        disabled: PropTypes.bool
    };

    componentDidMount () {
        if (!this.props.socket) return;

        for (let ev in this.socketListensers) {
            this.props.socket.on(ev, this.socketListensers[ev]);
        }
    }
    componentWillUnmount () {
        if (!this.props.socket) return;

        for (let ev in this.socketListensers) {
            this.props.socket.removeListener(ev, this.socketListensers[ev]);
        }
    }
    componentWillReceiveProps (nextProps) {
        if (!nextProps.register && this.props.open) nextProps.close();
    }
    /*componentDidUpdate(prevProps, prevState) {}*/
    shouldComponentUpdate (nextProps, nextState) {
        if (this.state.error == nextState.error && this.state.success == nextState.success && this.props.open == nextProps.open && this.props.dataType == nextProps.dataType && this.props.register == nextProps.register) return false;
        // if (nextProps.dataType === '') return false;
        return true;
    }

    socketListensers = {
        'WRITE_HOLDING_REGISTERS_SUCCESS': data => {
            if (Number(this.props.register) === Number(data.r) && this.props.open) {
                this.setState(Object.assign({}, this.state, { error: false, success: 'значение успешно записано' }));
                setTimeout(ctx => {
                    if (ctx.state.error) return;
                    ctx.setState(Object.assign({}, this.state, { error: false, success: false }));
                }, 3000, this);
            }
        },
        'WRITE_HOLDING_REGISTERS_ERROR': data => {
            // data = {
            //     error: err,
            //     r: r
            // }
            if (Number(this.props.register) === Number(data.r) && this.props.open) {
                this.setState(Object.assign({}, this.state, { error: 'ошибка', success: false }));
            }
        }
    };

    onKeyPress = ev => {
        if (ev.key === 'Enter') {
            ev.preventDefault();
            this.submit();
        }
    };

    close = () => {
        this.setState(Object.assign({}, this.state, { error: false, success: false }));
        this.props.close();
    };

    submit = () => {
        let rv = this.refs.registerValue.input.value;

        if (!rv || !rv.trim()) {
            this.setState(Object.assign({}, this.state, { error: 'не заполнено', success: false }));
            return;
        }

        rv = Number(rv.trim());
        if (isNaN(rv)) {
            this.setState(Object.assign({}, this.state, {
                error: 'некорректное значение',
                success: false
            }));
            return;
        }

        if (!IEEE754[this.props.dataType]) {
            this.setState(Object.assign({}, this.state, {
                error: 'не указан тип данных',
                success: false
            }));
            return;
        }

        if (rv > IEEE754[this.props.dataType].max) {
            this.setState(Object.assign({}, this.state, {
                error: 'максимум ' + IEEE754[this.props.dataType].max,
                success: false
            }));
            return;
        } else if (rv < IEEE754[this.props.dataType].min) {
            this.setState(Object.assign({}, this.state, {
                error: 'минимум ' + IEEE754[this.props.dataType].min,
                success: false
            }));
            return;
        }

        this.props.submit(rv);
    };

    render () {

        const errStyle      = { color: red500 };
        const successStyle  = { color: cyan500 };

        console.log('RENDER')

        const actions = [
            <FlatButton
                label={ 'Записать' }
                primary={ true }
                keyboardFocused={ false }
                onTouchTap={ this.submit }
                disabled={ this.props.disabled }
            />,
            <FlatButton
                label="Закрыть"
                secondary={ true }
                keyboardFocused={ false }
                onTouchTap={ this.close }
                disabled={ this.props.disabled }
            />
        ];

        return (
            <Dialog
                actions={ actions }
                title={ 'Регистр ' + this.props.register }
                modal={ true }
                contentStyle={{ width: '304px' }}
                autoScrollBodyContent={ false }
                open={ this.props.open }
                onRequestClose={ () => { this.setState(Object.assign({}, this.state, { error: false, success: false })); } }
            >
                <div style={{ height: '50px' }}>
                    <TextField
                        disabled={ this.props.disabled }
                        autoFocus={ true }
                        onKeyPress={ this.onKeyPress }
                        name="registerValue"
                        ref="registerValue"
                        onChange={ (ev, newValue) => {
                            if (!this.state.error && !this.state.success) return;
                            this.setState(Object.assign({}, this.state, { error: false, success: false }));
                        } }
                        errorText={ this.state.error || this.state.success }
                        errorStyle={ this.state.error ? errStyle : successStyle }
                        hintText={ 'введите значение' }
                    />
                </div>
            </Dialog>
        );
    }
}