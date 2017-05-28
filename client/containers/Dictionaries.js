'use strict';

import styles from './Dictionaries.styl';

import React, { Component }     from 'react';
import PropTypes                from 'prop-types';


import { connect }              from 'react-redux';
import { usersRead, usersUpdate, usersDelete, modalShow, modalHide, usersCreate, inputChange, dispatch } from '../actions';
import { USERS, _CREATE, _UPDATE, _DELETE, _SUCCESS, _ERROR } from '../actions/constants';


/*@connect(
    state => {
        const { users, modal, common } = state;
        return { users, modal, common };
    }, { usersRead, modalShow, modalHide, usersCreate, usersUpdate, usersDelete, inputChange, dispatch }
)*/
export default class Dictionaries extends Component {
    constructor (...props) {
        super(...props);

    }

    static defaultProps = {};
    static propTypes = {
        /* reducers */

        socket: PropTypes.object
    };


    render () {
        return (<h1>СПРАВОЧНИКИ</h1>)
    }
}

