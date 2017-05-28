'use strict';

import moment from 'moment';

import React, { Component }     from 'react';
import PropTypes                from 'prop-types';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FaceIcon      from 'material-ui/svg-icons/action/face';
import Toggle from 'material-ui/Toggle';
import FlatButton from 'material-ui/FlatButton';

import { USERS, _CREATE, _UPDATE, _CLEAR, _SUCCESS, _ERROR } from '../../actions/constants'

export default class UsersList extends Component {
    constructor(...props) {
        super(...props)
    }
    static propTypes = {
        users: PropTypes.array,
        showHistory: PropTypes.func,
        usersEdit: PropTypes.func,
        usersUpdate: PropTypes.func,
        usersDelete: PropTypes.func,
        socket: PropTypes.object
    };

    changeUserActivity = user => {
        let updatedUser = Object.assign({}, user, {
            active: !user.active
        });

        this.props.usersUpdate(updatedUser, { skipSuccess: true });
    };

    unblockUser = user => {
        let updatedUser = Object.assign({}, user, {
            locked_until: null
        });

        this.props.usersUpdate(updatedUser, { skipSuccess: true });
    };

    componentDidUpdate(prevProps, prevState) { }

    render() {
        const usersList = this.props.users.map(user => {
            return <Card key={ user._id } expanded={ false } onExpandChange={ undefined }>
                <CardHeader
                    title={ user.name + ' ' + user.surname }
                    subtitle={ user.role == 'superuser' ? 'суперпользователь' : user.role == 'admin' ? 'администратор': 'просмотр' }
                    avatar={<FaceIcon></FaceIcon> || user.avatar}
                    actAsExpander={ true }
                    showExpandableButton={ false }
                />
                <CardText>
                    { (__USER__._id !== user._id && user.immortal != true) ?
                    <Toggle
                        toggled={ user.active }
                        onToggle={ () => { this.changeUserActivity(user); } }
                        labelPosition="right"
                        label={ user.active ? 'Закрыть доступ' : 'Открыть доступ' }
                    /> : null }
                    { (__USER__._id !== user._id && user.immortal != true && user.locked_until) ?
                        <Toggle
                            toggled={ Boolean(user.locked_until) }
                            onToggle={ () => { this.unblockUser(user); } }
                            labelPosition="right"
                            label={ user.locked_until ? 'Разблокировать | заблокирован до: ' + moment(user.locked_until).format('DD-MM-YYYY HH:mm') + ' | неверных попыток ввода пароля: ' + user.signin_attempts : '' }
                        /> : null }
                    <span>Последняя активность: { moment(user.last_activity).format('DD-MM-YYYY в HH:mm') }</span>
                </CardText>
                <CardActions>
                    { user.immortal != true ? <FlatButton label="РЕДАКТИРОВАТЬ" primary={ true } onTouchTap={ () => { this.props.usersEdit(user); } } /> : null}
                    { (__USER__._id !== user._id && user.immortal != true) ? <FlatButton label="УДАЛИТЬ" secondary={ true } onTouchTap={ () => { this.props.usersDelete(user._id, { skipSuccess: true }); } } /> : null }

                    <FlatButton label="ИСТОРИЯ ДЕЙСТВИЙ" onTouchTap={ () => { this.props.showHistory(user); } } />
                </CardActions>
            </Card>
        });

        return (
            <div>
                {usersList}
            </div>
        );
    }
}