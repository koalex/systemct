'use strict';

import styles from './Users.styl';

import React, { Component }     from 'react';
import PropTypes                from 'prop-types';
import FloatingActionButton     from 'material-ui/FloatingActionButton';
import PersonAddIcon            from 'material-ui/svg-icons/social/person-add';
import UsersList                from '../components/users/UsersList';
import AddEditUser from '../components/users/AddEditUsers';
import UserHistory from '../components/users/UserHistory';

import { connect }              from 'react-redux';
import { usersRead, usersUpdate, usersDelete, modalShow, modalHide, usersCreate, inputChange, dispatch } from '../actions';
import { USERS, ACTIVITY, _CREATE, _UPDATE, _DELETE, _SUCCESS, _ERROR } from '../actions/constants';

const MODAL_COMPONENTS = {
    'ADD_EDIT_USER': AddEditUser,
    'USER_HISTORY': UserHistory
    /* other modals */
};

const Modal = ({ modalType, props }) => {
    if (!modalType) return null;

    const Modal =  MODAL_COMPONENTS[modalType];

    return <Modal modalType={ modalType } {...props} ></Modal>;
};


@connect(
    state => {
        const { users, modal, common } = state;
        return { users, modal, common };
    }, { usersRead, modalShow, modalHide, usersCreate, usersUpdate, usersDelete, inputChange, dispatch }
)
export default class Users extends Component {
    constructor (...props) {
        super(...props);
        this.state = {};

    }

    static defaultProps = {};
    static propTypes = {
        /* reducers */
        common: PropTypes.object,
        modal: PropTypes.object,
        users: PropTypes.object,
        /* actions */
        usersCreate: PropTypes.func,
        usersRead: PropTypes.func,
        usersUpdate: PropTypes.func,
        usersDelete: PropTypes.func,
        modalShow: PropTypes.func,
        modalHide: PropTypes.func,
        dispatch: PropTypes.func,
        socket: PropTypes.object
    };

    socketListensers = {
        [USERS + _CREATE + _SUCCESS]: user => {
           this.props.dispatch({
               type: USERS + _CREATE + _SUCCESS,
               payload: user
           });
        },
        [USERS + _UPDATE + _SUCCESS]: user => {
            this.props.dispatch({
                type: USERS + _UPDATE + _SUCCESS,
                payload: user
            });
        },
        [USERS + ACTIVITY + _UPDATE + _SUCCESS]: user => {
            this.props.dispatch({
                type: USERS + ACTIVITY + _UPDATE + _SUCCESS,
                payload: user
            });
        },
        [USERS + _DELETE + _SUCCESS]: response => {
            this.props.dispatch({
                type: USERS + _DELETE + _SUCCESS,
                payload: response
            });
        }
    };

    componentDidMount () {
        this.props.usersRead();
        window.socket = this.props.socket;
        for (let ev in this.socketListensers) {
            this.props.socket.on(ev, this.socketListensers[ev]);
        }
    }

    componentWillUnmount () {
        for (let ev in this.socketListensers) {
            this.props.socket.removeListener(ev, this.socketListensers[ev]);
            // this.props.socket.removeAllListeners(ev);
        }
        // this.props.socket.close();

    }

    /*componentWillReceiveProps (props) { }*/
    /*shouldComponentUpdate (nextProps, nextState) { return true; }*/
    render () {
        const { common, modal, users, inputChange, modalShow, modalHide, usersCreate, usersRead, usersUpdate, usersDelete, socket, dispatch } = this.props;

        // modal props:
        const { modalType, ...rest }            = modal;
                              rest.users        = users;
                              rest.common       = common;
                              rest.modalHide    = modalHide;
                              rest.inputChange  = inputChange;
                              rest.usersCreate  = usersCreate;
                              rest.usersUpdate  = usersUpdate;
                              rest.dispatch     = dispatch;
                              rest.socket       = socket;

        return (
            <div style={{ flexGrow: '1' }}>
                <FloatingActionButton
                    onTouchTap={() => {
                        modalShow({
                            modalType: 'ADD_EDIT_USER',
                            mode: 'add',
                            user: null
                        }); }
                    }  className={ styles['add-user-btn'] }>

                    <PersonAddIcon></PersonAddIcon>
                </FloatingActionButton>

                { Modal({ modalType, props: rest }) }

                <UserHistory isOpen={ false } history={ [] }></UserHistory>

                <UsersList
                    users={ users.users || [] }

                    showHistory={ () => {
                        modalShow({
                            modalType: 'USER_HISTORY',
                            history: []
                        })
                    } }

                    usersEdit={ user => { modalShow({
                        modalType: 'ADD_EDIT_USER',
                        mode: 'edit',
                        user: user,
                    }) }}

                    usersUpdate={ usersUpdate }
                    usersDelete={ usersDelete }
                    socket={ socket }
                />
            </div>
        );
    }
}

