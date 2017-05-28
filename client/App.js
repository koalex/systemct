'use strict';

import styles from './App.styl';

import React, { Component } from 'react';
import PropTypes            from 'prop-types';
// import { Link }             from 'react-router-dom';
import { BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom';
// import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import AppBar               from 'material-ui/AppBar';
import Drawer               from 'material-ui/Drawer';
import MenuItem             from 'material-ui/MenuItem';
import IconButton           from 'material-ui/IconButton';
import NavigationClose      from 'material-ui/svg-icons/navigation/close';
import PeopleIcon           from 'material-ui/svg-icons/social/people';
import ExitIcon             from 'material-ui/svg-icons/action/exit-to-app';
import ChartIcon            from 'material-ui/svg-icons/editor/show-chart';
import LibraryIcon          from 'material-ui/svg-icons/av/library-books';


import { connect }              from 'react-redux';
import { signout } from './actions'

Object.defineProperty(window, '__USER__', {
    configurable: __DEVELOPMENT__,
    get: function () {
        return JSON.parse(window.localStorage.getItem('user'));
    }
});


@connect(state => state, { signout })
export default class App extends Component {
    constructor (...props) {
        super(...props);
        this.state = { drawerIsOpen: false }
    }
    static propTypes = {
        signout: PropTypes.func
    };

    toggleDrawer = () => {
        this.setState({ drawerIsOpen: !this.state.drawerIsOpen })
    };

    render() {

        return (
            <div className={styles['app-container']}>
                <AppBar
                    title={ "SYSTEMCT " + __USER__.name + " " + __USER__.surname }
                    onLeftIconButtonTouchTap={ this.toggleDrawer }
                />
                <Drawer
                    docked={ false }
                    width={ 300 }
                    open={ this.state.drawerIsOpen }
                    onRequestChange={ this.toggleDrawer }
                >
                    <AppBar
                        iconElementLeft={<IconButton onClick={ this.toggleDrawer }><NavigationClose /></IconButton>}
                    />
                    <Link to="/charts" className={styles['nav-link']}>
                        <MenuItem onTouchTap={ this.toggleDrawer } leftIcon={<ChartIcon></ChartIcon>}>
                            Графики
                        </MenuItem>
                    </Link>
                    { __USER__.role !== 'manager' ? <Link to="/users" className={styles['nav-link']}>
                        <MenuItem onTouchTap={ this.toggleDrawer } leftIcon={<PeopleIcon></PeopleIcon>}>
                            Пользователи
                        </MenuItem>
                    </Link> : null }
                    { __USER__.role !== 'manager' ? <Link to="/dictionaries" className={styles['nav-link']}>
                        <MenuItem onTouchTap={ this.toggleDrawer } leftIcon={<LibraryIcon></LibraryIcon>}>
                            Справочники
                        </MenuItem>
                    </Link> : null }

                    <Link to="/signin" className={styles['nav-link']}>
                        <MenuItem onTouchTap={ this.props.signout } leftIcon={<ExitIcon></ExitIcon>}>
                            Выйти
                        </MenuItem>
                    </Link>
                </Drawer>
                <div className={styles['main-content']}>
                    { this.props.children }
                </div>
            </div>
        );
    }
}
