'use strict';

import styles from './styles.styl';

import React, { Component }     from 'react';
import PropTypes                from 'prop-types';
import Dialog                   from 'material-ui/Dialog';
import TextField                from 'material-ui/TextField';
import FlatButton               from 'material-ui/FlatButton';


export default class RegisterAdd extends Component {
    constructor(...props) {
        super(...props);
        this.state = { error: false };
    }
    static propTypes = {
        registers: PropTypes.array.isRequired,// PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // register
        close: PropTypes.func,
        open: PropTypes.bool,
        disabled: PropTypes.bool
    };

    /*componentDidMount () {}*/
    /*componentWillUnmount () {}*/
    /*componentDidUpdate(prevProps, prevState) {}*/
    /*componentWillReceiveProps (nextProps) {}*/
    /*shouldComponentUpdate (nextProps, nextState) { return true; }*/

    onKeyPress = ev => {
        if (ev.key === 'Enter') {
            ev.preventDefault();
            this.submit();
        }
    };

    close = () => {
        this.setState(Object.assign({}, this.state, { error: false }));
        this.props.close();
    };

    submit = () => {
        let r = this.refs.register.input.value;

        if (!r || !r.trim()) {
            this.setState(Object.assign({}, this.state, { error: 'не заполнено' }));
            return;
        }

        if (isNaN(r)) {
            this.setState(Object.assign({}, this.state, { error: 'некорректный регистр' }));
            return;
        }

        if (Array.isArray(this.props.registers) && this.props.registers.length) {
            if (this.props.registers.some(_r => Number(_r) === Number(r))) {
                this.setState(Object.assign({}, this.state, { error: 'такой регистр уже есть' }));
                return;
            }
        }

        this.props.submit(r.trim());
    };

    render () {

        const actions = [
            <FlatButton
                label={ 'Создать' }
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
                title={ 'Добавить регистр' }
                modal={ true }
                contentStyle={{ width: '304px' }}
                autoScrollBodyContent={ false }
                open={ this.props.open }
                onRequestClose={ () => { this.setState(Object.assign({}, this.state, { error: false })); } }
            >
                <div style={{ height: '50px' }}>
                    <TextField
                        disabled={ this.props.disabled }
                        autoFocus={ true }
                        onKeyPress={ this.onKeyPress }
                        name="register"
                        ref="register"
                        onChange={ (ev, newValue) => {
                            if (!this.state.error) return;
                            this.setState(Object.assign({}, this.state, { error: false }));
                        } }
                        errorText={ this.state.error }
                        hintText={ 'например 0x0001' }
                    />
                </div>
            </Dialog>
        );
    }
}