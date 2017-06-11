'use strict';

import styles from './Dictionaries.styl';

import React, { Component }     from 'react';
import PropTypes                from 'prop-types';


import { connect }              from 'react-redux';
import { dictionaryCreate, dictionaryRead, modalShow, modalHide, inputChange, dispatch } from '../actions';
import { DICTIONARY, _CREATE, _UPDATE, _DELETE, _SUCCESS, _ERROR } from '../actions/constants';


@connect(
    state => {
        // const { users, modal, common } = state;
        return state/*{ users, modal, common }*/;
    }, { dictionaryCreate, dictionaryRead, modalShow, modalHide, inputChange, dispatch }
)
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
        const { dictionaryCreate } = this.props;

        return (<div>{ this.props.children }</div>)
    }
}

