'use strict';

import styles from './styles.styl';

import React, { Component }     from 'react';
import PropTypes                from 'prop-types';
import Dialog                   from 'material-ui/Dialog';
import TextField                from 'material-ui/TextField';
import FlatButton               from 'material-ui/FlatButton';
import { cyan500, red500 }      from 'material-ui/styles/colors';


export default class IpPort extends Component {
    constructor(...props) {
        super(...props);
        this.state = { errors: {} };
    }
    static propTypes = {
        ip: PropTypes.string,
        port: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        submit: PropTypes.func.isRequired,
        close: PropTypes.func,
        open: PropTypes.bool,
        disabled: PropTypes.bool
    };

    /*componentDidMount () {}*/
    /*componentWillUnmount () {}*/
    /*componentDidUpdate(prevProps, prevState) {}*/
    /*componentWillReceiveProps (nextProps) {}*/
    /*shouldComponentUpdate (nextProps, nextState) { return true; }*/

    onIpPartChange = (ev, newValue) => {
        if (!newValue) return;
        if (!newValue.trim()) return;

        newValue = Number(newValue);

        let ref = ev.target.getAttribute('name');

        if (isNaN(newValue)) {
            this.refs[ref].input.value = this.refs[ref].input.value.slice(0, -1);
            return;
        }

        if (Number.isFinite(newValue)) {
            if (Number(this.refs[ref].input.value) > 255) {
                this.refs[ref].input.value = 255;
            }
        }

        if (this.state.errors[ref]) {
            let nextState = Object.assign({}, this.state);
            nextState.errors[ref] = false;

            this.setState(nextState);
        }

        this.refs[ref].input.value = parseInt(this.refs[ref].input.value);
    };

    onIpKeyPress = ev => {
        if (ev.key === 'Enter') {
            ev.preventDefault();
            this.submit();
        }
    };

    get ipStrSplitted () {
        if (this.props.ip && typeof this.props.ip === 'string' && /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/.test(this.props.ip)) {
            return this.props.ip.split('.').map(v => parseInt(v));
        }
        return [null, null, null, null];
    };

    get portFromIpStr () {
        if (this.props.ip && typeof this.props.ip === 'string' && /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}:[0-9]{1,5}/.test(this.props.ip)) {
            return this.props.ip.split(':')[1];
        }
        return null;
    };

    close = () => {
        this.setState({ errors: {} });
        this.props.close();
    };

    submit = () => {
        let fail = false;

        for (let i = 1; i <= 4; i++) {
            let refVal = this.refs['ipPart' + i].input.value;
            if (!refVal || !refVal.trim()) {
                let nextState = Object.assign({}, this.state);
                    nextState.errors['ipPart' + i] = true;
                this.setState(nextState);
                fail = true;
            } else {
                refVal = Number(refVal);
                if (!Number.isFinite(refVal) || refVal > 255) {
                    let nextState = Object.assign({}, this.state);
                        nextState.errors['ipPart' + i] = true;
                    this.setState(nextState);
                    fail = true;
                }
            }
        }

        let portVal = this.refs['ipPort'].input.value;

        if (!portVal || !portVal.trim()) {
            let nextState = Object.assign({}, this.state);
                nextState.errors['ipPort'] = true;
            this.setState(nextState);
            fail = true;
        }

        portVal = Number(portVal);

        if (!Number.isFinite(portVal) || portVal > 65535 || portVal === 0) {
            let nextState = Object.assign({}, this.state);
                nextState.errors['ipPort'] = true;
            this.setState(nextState);
            fail = true;
        }

        if (!fail) {
            let data = { ip: '' };

            for (let i = 1; i <= 4; i++) { data.ip += this.refs['ipPart' + i].input.value.trim() + (i == 4 ? '' : '.'); }

            data.port = Number(this.refs['ipPort'].input.value.trim());

            this.props.submit(data);
        }
    };

    render () {
        
        const actions = [
            <FlatButton
                label="Сохранить"
                primary={ true }
                disabled={ this.props.disabled }
                onTouchTap={ this.submit }
            />,
            <FlatButton
                label="Закрыть"
                secondary={ true }
                disabled={ this.props.disabled }
                onTouchTap={ this.close }
            />
        ];

        return (
            <Dialog
                actions={ actions }
                title={ 'IP адрес и порт устройства' }
                modal={ true }
                contentStyle={{ width: '400px' }}
                autoScrollBodyContent={ false }
                open={ this.props.open }
                onRequestClose={ () => { this.setState({ errors: {} }); } }
            >
                <form className={ styles['ip-address-parts'] }>
                    <TextField
                        disabled={ this.props.disabled }
                        defaultValue={ this.ipStrSplitted[0] }
                        className={ styles['ip-address-part'] }
                        style={{ borderColor: this.state.errors['ipPart1'] ? red500 : cyan500 }}
                        underlineShow={ false }
                        autoFocus={ true }
                        onKeyPress={ this.onIpKeyPress }
                        name="ipPart1"
                        ref="ipPart1"
                        onChange={ this.onIpPartChange }
                        hintText={ '192' }
                    />
                    &nbsp;
                    <span className={ styles['ip-address-dot-delim'] }>.</span>
                    &nbsp;
                    <TextField
                        disabled={ this.props.disabled }
                        defaultValue={ this.ipStrSplitted[1] }
                        className={ styles['ip-address-part'] }
                        style={{ borderColor: this.state.errors['ipPart2'] ? red500 : cyan500 }}
                        underlineShow={ false }
                        onKeyPress={ this.onIpKeyPress }
                        name="ipPart2"
                        ref="ipPart2"
                        onChange={ this.onIpPartChange }
                        hintText={ '168' }
                    />
                    &nbsp;
                    <span className={ styles['ip-address-dot-delim'] }>.</span>
                    &nbsp;
                    <TextField
                        disabled={ this.props.disabled }
                        defaultValue={ this.ipStrSplitted[2] }
                        className={ styles['ip-address-part'] }
                        style={{ borderColor: this.state.errors['ipPart3'] ? red500 : cyan500 }}
                        underlineShow={ false }
                        onKeyPress={ this.onIpKeyPress }
                        name="ipPart3"
                        ref="ipPart3"
                        onChange={ this.onIpPartChange }
                        hintText={ '255' }
                    />
                    &nbsp;
                    <span className={ styles['ip-address-dot-delim'] }>.</span>
                    &nbsp;
                    <TextField
                        disabled={ this.props.disabled }
                        defaultValue={ this.ipStrSplitted[3] }
                        className={ styles['ip-address-part'] }
                        style={{ borderColor: this.state.errors['ipPart4'] ? red500 : cyan500 }}
                        underlineShow={ false }
                        onKeyPress={ this.onIpKeyPress }
                        name="ipPart4"
                        ref="ipPart4"
                        onChange={ this.onIpPartChange }
                        hintText={ '100' }
                    />
                    &nbsp;
                    <span className={ styles['ip-address-port-delim'] }>:</span>
                    &nbsp;
                    <TextField
                        disabled={ this.props.disabled }
                        defaultValue={ parseInt(this.props.port) || this.portFromIpStr }
                        className={ styles['ip-address-port'] }
                        style={{ borderColor: this.state.errors['ipPort'] ? red500 : cyan500 }}
                        underlineShow={ false }
                        onKeyPress={ this.onIpKeyPress }
                        name="ipPort"
                        ref="ipPort"
                        onChange={ (ev, newValue) => {
                            if (!newValue) return;
                            if (!newValue.trim()) return;

                            newValue = Number(newValue);

                            if (isNaN(newValue)) {
                                this.refs.ipPort.input.value = this.refs.ipPort.input.value.slice(0, -1);
                                return;
                            }

                            if (Number.isFinite(newValue)) {
                                if (Number(this.refs.ipPort.input.value) > 65535) {
                                    this.refs.ipPort.input.value = 65535;
                                }
                            }

                            if (this.state.errors['ipPort']) {
                                let nextState = Object.assign({}, this.state);
                                    nextState.errors['ipPort'] = false;
                                this.setState(nextState);
                            }

                            this.refs.ipPort.input.value = parseInt(this.refs.ipPort.input.value);
                        } }
                        hintText={ '3000' }
                    />
                </form>
            </Dialog>
        );
    }
}