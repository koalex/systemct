'use strict';

import styles from './AddEditUsers.styl';

import React, { Component }     from 'react';
import PropTypes                from 'prop-types';
import Dialog from 'material-ui/Dialog';
import TextField                from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Snackbar                 from 'material-ui/Snackbar';
import { USERS, _CREATE, _UPDATE, _CLEAR, _SUCCESS, _ERROR } from '../../actions/constants'

export default class AddEditUsers extends Component {
    constructor(...props) {
        super(...props);
    }
    static propTypes = {
        isOpen: PropTypes.bool,
        mode: PropTypes.string.isRequired,
        modalType: PropTypes.string.isRequired,

        common: PropTypes.object,
        users: PropTypes.object,

        inputChange: PropTypes.func,
        modalHide: PropTypes.func,
        usersCreate: PropTypes.func,
        usersRead: PropTypes.func,
        usersUpdate: PropTypes.func,
        dispatch: PropTypes.func,
        socket: PropTypes.object
    };

    socketListensers = {
        [USERS + _CREATE + _SUCCESS]: () => {
            this.props.modalHide({ modalType: this.props.modalType })
        },
        [USERS + _UPDATE + _SUCCESS]: () => {
            this.props.modalHide({ modalType: this.props.modalType })
        }
    };

    componentDidMount () {
        for (let ev in this.socketListensers) {
            this.props.socket.on(ev, this.socketListensers[ev]);
        }
    }

    componentWillUnmount () {
        for (let ev in this.socketListensers) {
            this.props.socket.removeListener(ev, this.socketListensers[ev]);
        }
    }

    /*componentDidUpdate(prevProps, prevState) {}*/
    /*componentWillReceiveProps (nextProps) {}*/
    /*shouldComponentUpdate (nextProps, nextState) { return true; }*/

    submit = () => {

        const mode = this.props.mode;

        const currentUser = this.props.users.user;

        let user = {
            name: this.refs.nameInput.input.value,
            patronymic: this.refs.patronymicInput.input.value,
            surname: this.refs.surnameInput.input.value,
            phone: this.refs.phoneInput.input.value,
            email: this.refs.emailInput.input.value,
            role: this.refs.roleSelect.props.value
        };

         if ('edit' === mode) user.active = currentUser.active;

        if (__USER__._id !== currentUser._id && currentUser.immortal != true) {
            user.password                = this.refs.passwordInput.input.value;
            user.passwordConfirmation    = this.refs.passwordConfirmationInput.input.value;

            if (!user.password.trim()) delete user.password;
            if (!user.passwordConfirmation.trim()) delete user.passwordConfirmation;
        }

        if (currentUser._id && 'edit' === mode) {
            user._id = currentUser._id
        }

        if ('edit' === mode) {
            this.props.usersUpdate(user, { skipSuccess: true });
        } else if ('add'  === mode) {
            this.props.usersCreate(user, { skipSuccess: true });
        }
    };

    inputChange = (data) => {
        let needToClearErrors = this.props.users.error || Object.keys(this.props.users.errors).length;

        if (needToClearErrors) this.props.dispatch({ type: _ERROR + _CLEAR });

        this.props.inputChange(data)
    };

    render () {
        const { modalType, mode } = this.props;

        const { user } = this.props.users;

        const actions = [
            <FlatButton
                label="Сохранить"
                primary={ true }
                keyboardFocused={ true }
                onTouchTap={ this.submit }
            />,
            <FlatButton
                label="Отмена"
                primary={ true }
                keyboardFocused={ true }
                onTouchTap={ () => { this.props.modalHide({ modalType }) } }
            />

        ];

        return (
            <div>
                <Snackbar
                    open={ Boolean(this.props.users.error) }
                    message={ this.props.users.error || '' }
                    autoHideDuration={ 2000 }
                />
                <Dialog
                    title={ 'edit' === mode ? user.name + ' ' + user.surname: 'Добавить пользователя'}
                    actions={ actions }
                    modal={ true }
                    autoScrollBodyContent={ true }
                    open={ this.props.isOpen }
                >
                    <div className={ styles['add-edit-users-dialog-content'] }>
                        <TextField
                            defaultValue={ user.name }
                            onBlur={ () => { this.inputChange({ componentName: 'addEditUser', name: this.refs.nameInput.input.value }); } }
                            name="name"
                            ref="nameInput"
                            disabled={ this.props.users.isLoading }
                            floatingLabelText="Имя пользователя"
                            errorText={ this.props.users.errors.name }
                        />
                        <TextField
                            defaultValue={ user.patronymic }
                            onBlur={ () => { this.inputChange({ componentName: 'addEditUser', patronymic: this.refs.patronymicInput.input.value }); } }
                            name="patronymic"
                            ref="patronymicInput"
                            disabled={ this.props.users.isLoading }
                            floatingLabelText="Отчество пользователя"
                            errorText={ this.props.users.errors.patronymic }
                        />
                        <TextField
                            defaultValue={ user.surname }
                            onBlur={ () => { this.inputChange({ componentName: 'addEditUser', surname: this.refs.surnameInput.input.value }); } }
                            name="surname"
                            ref="surnameInput"
                            disabled={ this.props.users.isLoading }
                            floatingLabelText="Фамилия пользователя"
                            errorText={ this.props.users.errors.surname }
                        />
                        <TextField
                            defaultValue={ user.phone }
                            onBlur={ () => { this.inputChange({ componentName: 'addEditUser', phone: this.refs.phoneInput.input.value }); } }
                            name="phone"
                            ref="phoneInput"
                            disabled={ this.props.users.isLoading }
                            floatingLabelText="Телефон"
                            errorText={ this.props.users.errors.phone }
                        />
                        <TextField
                            defaultValue={ user.email }
                            onBlur={ () => { this.inputChange({ componentName: 'addEditUser', email: this.refs.emailInput.input.value }); } }
                            name="email"
                            ref="emailInput"
                            disabled={ this.props.users.isLoading }
                            floatingLabelText="Email"
                            errorText={ this.props.users.errors.email }
                        />
                        <SelectField
                            value={ user.role }
                            defaultValue={ user.role }
                            floatingLabelText="Роль"
                            name="role"
                            ref="roleSelect"
                            disabled={ this.props.users.isLoading }
                            onChange={ (ev, i, v) => { this.inputChange({ componentName: 'addEditUser', role: v }); } }
                            errorText={ this.props.users.errors.role }
                        >
                            <MenuItem value={ 'admin' } primaryText="Администратор" />
                            <MenuItem value={ 'manager' } primaryText="Просмотр" />
                        </SelectField>
                        {
                            (__USER__._id !== user._id && user.immortal != true) ? <TextField
                                defaultValue={ user.password }
                                onBlur={ () => { this.inputChange({ componentName: 'addEditUser', password: this.refs.passwordInput.input.value }); } }
                                type="password"
                                name="password"
                                ref="passwordInput"
                                disabled={ this.props.users.isLoading }
                                floatingLabelText="Пароль"
                                errorText={ this.props.users.errors.password }
                            /> : null
                        }
                        {
                            (__USER__._id !== user._id && user.immortal != true)  ? <TextField
                                defaultValue={ user.passwordConfirmation }
                                onBlur={ () => { this.inputChange({ componentName: 'addEditUser', passwordConfirmation: this.refs.passwordConfirmationInput.input.value }); } }
                                type="password"
                                name="passwordConfirmation"
                                ref="passwordConfirmationInput"
                                disabled={ this.props.users.isLoading }
                                floatingLabelText="Повторите пароль"
                                errorText={this.props.users.errors.password }
                            /> : null
                        }


                    </div>
                </Dialog>
            </div>


        );
    }
}

