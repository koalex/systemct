'use strict';

import styles from './Logs.styl';

import React, { Component }         from 'react';
import PropTypes                    from 'prop-types';
// import UsersList                from '../components/users/UsersList';

import { connect }                  from 'react-redux';
import { dictionaryRead, dispatch } from '../../actions';
import { LOGS, DICTIONARY, SENSOR, DEVICE, PROJECT, _CREATE, _READ, _UPDATE, _DELETE, _EXPORT, _IMPORT,  _SUCCESS, _ERROR } from '../actions/constants';


@connect(
    state => {
        const { logs, sensors, devices, projects, common } = state;
        return { logs, sensors, devices, projects, common };
    }, { dictionaryRead, dispatch }
)
export default class Logs extends Component {
    constructor (...props) {
        super(...props);
        this.state = {};

    }

    static defaultProps = {};
    static propTypes = {
        /* reducers */
        logs: PropTypes.object,
        sensors: PropTypes.object,
        devices: PropTypes.object,
        projects: PropTypes.object,
        common: PropTypes.object,
        /* actions */
        dictionaryRead: PropTypes.func,
        dispatch: PropTypes.func,
        socket: PropTypes.object
    };

    /*socketListensers = {};*/

    componentDidMount () {
        if (!this.props.projects.items.length) this.props.dictionaryRead('project');
        /*for (let ev in this.socketListensers) {
            this.props.socket.on(ev, this.socketListensers[ev]);
        }*/
    }

    componentWillUnmount () {
        /*for (let ev in this.socketListensers) {
            this.props.socket.removeListener(ev, this.socketListensers[ev]);
            // this.props.socket.removeAllListeners(ev);
        }*/

    }

    render () {
        const reducer = this.props.logs;

        return (
            <div>

            </div>
        );
    }
}

