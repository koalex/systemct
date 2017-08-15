'use strict';

import styles from './index.styl';

import React, { Component }     from 'react';
import PropTypes                from 'prop-types';
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';


import { connect }              from 'react-redux';
// import { projectDeviceSensorEdit } from '../../actions';
import { _CREATE, _READ, _UPDATE, _DELETE } from '../../actions/constants';


@connect(
    state => {
        const { sensors, devices, projects, modal, common } = state;
        return { sensors, devices, projects, modal, common };
    }, { projectDeviceSensor }
)
export default class _Device extends Component {
    constructor(...props) {
        super(...props);
    }
    static propTypes = {
        // socket: PropTypes.object
    };

    socketListensers = {
        /*'READ_HOLDING_REGISTERS_SUCCESS': data => {
            this.props.dispatch({
                type: 'READ_HOLDING_REGISTERS_SUCCESS',
                payload: data
            });
        }*/
    };

    componentDidMount () {
        // for (let ev in this.socketListensers) this.props.socket.on(ev, this.socketListensers[ev]);
    }

    componentWillUnmount () {
        /*for (let ev in this.socketListensers) {
            this.props.socket.removeListener(ev, this.socketListensers[ev]);
        }*/
    }

    /*componentDidUpdate(prevProps, prevState) {}*/
    /*componentWillReceiveProps (nextProps) {}*/
    /*shouldComponentUpdate (nextProps, nextState) { return true; }*/

    render () {
        let reducer = this.props.projects;

        return (<h1>LOGS</h1>);
    }
}
