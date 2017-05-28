'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Dialog from 'material-ui/Dialog';
import { List, ListItem } from 'material-ui/List';
import FlatButton from 'material-ui/FlatButton';

export default class UserHistory extends Component {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        history: PropTypes.array,
        isOpen: PropTypes.bool,
        modalHide: PropTypes.func
    };

    render() {
        const actions = [
            <FlatButton
                label="Закрыть"
                primary={ true }
                keyboardFocused={true}
                onTouchTap={ () => { this.props.modalHide(); } }
            />
        ];

        const historyListItems = this.props.history.map(histItem => <ListItem key={ histItem._id } primaryText={ histItem } />);

        return (
            <Dialog
                title="Василий Чапаев :: история действий"
                actions={ actions }
                modal={ false }
                open={ this.props.isOpen }
                onRequestClose={ () => { } }
                autoScrollBodyContent={ true }
            >
                <List>
                    { historyListItems }
                </List>
            </Dialog>
        );
    }
}