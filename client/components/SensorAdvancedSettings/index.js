'use strict';

import styles from './styles.styl';

import React, { Component }     from 'react';
import PropTypes                from 'prop-types';

import Dialog                   from 'material-ui/Dialog';
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';
import TextField                from 'material-ui/TextField';
import Checkbox                 from 'material-ui/Checkbox';
import SelectField              from 'material-ui/SelectField';
import MenuItem                 from 'material-ui/MenuItem';
import FlatButton               from 'material-ui/FlatButton';
import IconButton               from 'material-ui/IconButton';
import FloatingActionButton     from 'material-ui/FloatingActionButton';
import PlusCircleIcon           from 'material-ui/svg-icons/content/add-circle-outline';

import { GithubPicker }         from 'react-color';

import DeleteIcon                from 'material-ui/svg-icons/action/delete';

class SensorAdvancedSettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: {},
            settings: {},
            colorPicker: false
        };

        console.log(props.deviceId)
        console.log(props.sensor)
        if (props.sensor && Array.isArray(props.sensor.advancedSettings) && props.sensor.advancedSettings.length) {
            props.sensor.advancedSettings.forEach(setting => {
                this.state.settings[setting._id] = {};

                for (let key in setting) {
                    if (key != '_id') this.state.settings[setting._id][key] = setting[key];
                }
            });
        }
    }
    static propTypes = {
        submit: PropTypes.func.isRequired,
        close: PropTypes.func,
        open: PropTypes.bool,
        disabled: PropTypes.bool,
        deviceId: PropTypes.string,
        sensor: PropTypes.object
    };

    /*componentDidMount () {}*/
    /*componentWillUnmount () {}*/
    /*componentDidUpdate(prevProps, prevState) {}*/
    /*componentWillReceiveProps (nextProps) {}*/
    shouldComponentUpdate (nextProps, nextState) { return nextProps.open }

    submit = () => {
        let fail = false;
        let nextState = Object.assign({}, this.state);

        Object.keys(this.state.settings).forEach(settingId => {
            this.props.sensor.registers.forEach(r => {
                if (!this.state.settings[settingId][r]) {
                    nextState.errors[settingId + r] = 'ошибка';
                    fail = true;
                }
            });
        });

        if (fail) {
            this.setState(nextState);
            return;
        }

        let resultSettings = Object.values(this.state.settings).map(setting => {
            if (setting._id.startsWith('newRule')) delete setting._id;
            return setting;
        });

        let result = { deviceId: this.props.deviceId, sensor: Object.assign({}, this.props.sensor, {
            advancedSettings: resultSettings
        }) };

        this.props.submit(result);
    };

    addRule = () => {
        let nextState = Object.assign({}, this.state);
        let _id = 'newRule' + Object.keys(nextState.settings).length;
        nextState.settings[_id] = {
            _id,
            aperture: null,
            color: '#008b02',
            state: null,
            emergency: null,
            blink: null
        };

        this.props.sensor.registers.forEach(r => {
            nextState.settings[_id][r] = null;
        });

        this.setState(nextState);
    };

    onRegisterValueChange = (ev, newValue, ruleId, r) => {
        if (!newValue) return;
        if (!newValue.trim()) return;

        newValue = Number(newValue);

        let ref = ev.target.getAttribute('name');

        if (isNaN(newValue)) {
            this.refs[ref].input.value = this.refs[ref].input.value.slice(0, -1);
            return;
        }

        if (this.state.errors[ref]) {
            let nextState = Object.assign({}, this.state);
                nextState.errors[ref] = false;

            this.setState(nextState);
            return;
        }

        let nextState = Object.assign({}, this.state);
            nextState.settings[ruleId][r] = newValue;


        // this.refs[ref].input.value = parseInt(this.refs[ref].input.value);
    };
    
    colorChange = (ev, ruleId, color) => {
        let nextState = Object.assign({}, this.state);
            nextState.settings[ruleId].color = color;
            nextState.colorPicker = null;
        this.setState(nextState);
        // ev.stopPropagation();
    };

    blinkChange = (ruleId, blinkValue) => {
        let nextState = Object.assign({}, this.state);
            nextState.settings[ruleId].blink = blinkValue;
        this.setState(nextState);
    };

    emergencyChange = (ruleId, emergencyValue) => {
        let nextState = Object.assign({}, this.state);
            nextState.settings[ruleId].emergency = emergencyValue;
        this.setState(nextState);
    };

    settingStateChange = (ruleId, stateValue) => {
        let nextState = Object.assign({}, this.state);
            nextState.settings[ruleId].state = stateValue;
        this.setState(nextState);
    };

    apertureChange = (ruleId, apertureValue) => {
        let nextState = Object.assign({}, this.state);
            nextState.settings[ruleId].aperture = apertureValue;
        this.setState(nextState);
    };

    removeRule = ruleId => {
        let nextState = Object.assign({}, this.state);
        if (nextState.settings[ruleId]) delete nextState.settings[ruleId];
        this.setState(nextState);
    };

    render() {
        const dialogActions = [
            <FlatButton
                style={{ float: 'left' }}
                label="+ правило"
                primary={ true }
                keyboardFocused={ false }
                onTouchTap={ this.addRule }
                disabled={ this.props.disabled || !this.props.sensor || !Array.isArray(this.props.sensor.registers) || !this.props.sensor.registers.length }
            />,
            <FlatButton
                label="Сохранить"
                primary={ true }
                keyboardFocused={ false }
                onTouchTap={ this.submit }
                disabled={ this.props.disabled }
            />,
            <FlatButton
                label="Отмена"
                secondary={ true }
                keyboardFocused={ false }
                onTouchTap={ this.props.close }
                disabled={ this.props.disabled }
            />
        ];

        const colors = ['#000000', '#ffffff', '#db3e00', '#fccb00', '#008b02', '#1273de' ];

        const registersExist    = this.props.sensor && Array.isArray(this.props.sensor.registers) && this.props.sensor.registers.length;
        let tableHeaderColumns  = null;
        let tableBody           = null;

        const genBodyRowColumns = (rule, ruleId) => {
            // this.props.sensor.registers
            rule._id = ruleId;
            let cols = (this.props.sensor.registers).map((r, i) => {
                return (<TableRowColumn>
                    <TextField
                        name={ rule._id + r }
                        ref={ rule._id + r }
                        onChange={ (ev, v) => {
                            this.onRegisterValueChange(ev, v, rule._id, r)
                        } }
                        defaultValue={ rule[r] }
                        errorText={ this.state.errors[rule._id + r] }
                    ></TextField>
                </TableRowColumn>)
            });

            if (this.props.sensor.type !== 'дискретный') {
                cols.push(<TableRowColumn>
                    <SelectField
                        style={{ width: '65px' }}
                        name={ rule._id + 'aperture' }
                        value={ rule.aperture }
                        onChange={ (event, index, value) => {
                            this.apertureChange(rule._id, value);
                        } }
                    >
                        <MenuItem value={ null } primaryText="" />
                        { [0.5,1,2,3,4,5,6,7,8,9,10].map(ap => <MenuItem value={ ap } primaryText={ ap + '%' } />) }
                    </SelectField>
                </TableRowColumn>);
            }
            cols.push(<TableRowColumn style={{ overflow: 'visible' }}>
                <div
                    style={{ position: 'relative', top: '13px', cursor: 'pointer', width: '25px', height: '25px', backgroundColor: rule.color }}
                    onClick={ ev => { this.setState(Object.assign({}, this.state, {
                        colorPicker: rule._id
                    })) } }
                >
                    <div style={{ position: 'absolute', top: '35px', left: '-5px', zIndex: 9999, display: this.state.colorPicker === rule._id ? 'block' : 'none' }}>
                        <GithubPicker
                            width={ 151 }
                            colors={ colors }
                            onChangeComplete={ (color, ev) => {
                                this.colorChange(ev, rule._id, color.hex);
                            }}
                        />
                    </div>
                </div>
            </TableRowColumn>);
            cols.push(<TableRowColumn style={{ paddingLeft: 0 }}>
                <Checkbox
                    style={{ position: 'relative', top: '13px'}}
                    name={ rule._id + 'blink' }
                    disabled={ this.props.disabled }
                    defaultChecked={ rule.blink }
                    onCheck={ (ev, isInputChecked) => {
                        this.blinkChange(rule._id, isInputChecked);
                    } }
                />
            </TableRowColumn>);
            cols.push(<TableRowColumn style={{ paddingLeft: 0, width: '150px' }}>
                <SelectField
                    style={{ width: '140px' }}
                    name={ rule._id + 'state' }
                    value={ rule.state }
                    onChange={ (event, index, value) => {
                        this.settingStateChange(rule._id, value);
                    } }
                >
                    <MenuItem value={ null } primaryText="" />
                    <MenuItem value="Выключен" primaryText="Выключен" />
                    <MenuItem value="Включен" primaryText="Включен" />
                    <MenuItem value="Ошибка" primaryText="Ошибка" />
                </SelectField>
            </TableRowColumn>);
            cols.push(<TableRowColumn >
                <Checkbox
                    style={{ position: 'relative', top: '13px'}}
                    name={ rule._id + 'emergency' }
                    disabled={ this.props.disabled }
                    defaultChecked={ rule.emergency }
                    onCheck={ (ev, isInputChecked) => {
                        this.emergencyChange(rule._id, isInputChecked);
                    } }
                />
            </TableRowColumn>);

            cols.push(<TableRowColumn style={{ paddingLeft: 0, paddingRight: 0, overflow: 'visible', textAlign: 'right' }}>
                <IconButton
                    tooltip="удалить"
                    tooltipPosition="bottom-left"
                    onTouchTap={ () => {
                        this.removeRule(rule._id);
                    } }>
                    <DeleteIcon/>
                </IconButton>
            </TableRowColumn>);

            return cols;
        };

        if (registersExist) {
            tableHeaderColumns = this.props.sensor.registers.map(r => {
                return (<TableHeaderColumn tooltip={ 'Значение регистра ' + r + ' с учётом апертуры (апертура НЕ учитывается для дискретных датчиков)' } style={{ fontWeight: 'bold' }}>
                    Регистр: { r }
                </TableHeaderColumn>)
            });

            if (this.props.sensor.type !== 'дискретный') {
                tableHeaderColumns.push(<TableHeaderColumn tooltip="Апертура">Апертура</TableHeaderColumn>);
            }
            tableHeaderColumns.push(<TableHeaderColumn tooltip="Цвет">Цвет</TableHeaderColumn>);
            tableHeaderColumns.push(<TableHeaderColumn tooltip="Мигание" style={{ paddingLeft: 0 }}>Мигание</TableHeaderColumn>);
            tableHeaderColumns.push(<TableHeaderColumn tooltip="Статус" style={{ paddingLeft: 0, width: '150px' }}>Статус</TableHeaderColumn>);
            tableHeaderColumns.push(<TableHeaderColumn tooltip="Аварийный режим">Аварийный <br/> режим</TableHeaderColumn>);
            tableHeaderColumns.push(<TableHeaderColumn style={{ paddingLeft: 0, paddingRight: 0, overflow: 'visible' }}></TableHeaderColumn>);
            // this.props.sensor.advancedSettings
            /*if (Array.isArray(this.props.sensor.advancedSettings) && this.props.sensor.advancedSettings.length) {
                tableBody = [{ _id: 'sljfnjvn3424', '2048': 123, '2050': 777, color: '#ff0', blink: true, emergency: true, state: 'Выключен' }].map(rule => {
                    return <TableRow key={ rule._id }>
                        { genBodyRowColumns(rule) }
                    </TableRow>;
                });
            }*/
            tableBody = Object.keys(this.state.settings).map(settingId => {
                return <TableRow style={{ verticalAlign: 'top' }} key={ settingId }>
                    { genBodyRowColumns(this.state.settings[settingId], settingId) }
                </TableRow>;
            });
            /*tableBody = [{ _id: 'sljfdnjvn3424', '2048': 123, '2050': 777, aperture: 10, color: '#db3e00', blink: false, emergency: true, state: 'Выключен' }].map(rule => {
                return <TableRow style={{ verticalAlign: 'top' }} key={ rule._id }>
                    { genBodyRowColumns(rule) }
                </TableRow>;
            });*/
        }

        return (
            <Dialog
                title={ this.props.sensor.title.toUpperCase() }
                actions={ dialogActions }
                modal={ true }
                autoScrollBodyContent={ true }
                open={ this.props.open }
                contentStyle={{ width: '940px', maxWidth: 'none' }}
            >
                <Table
                    selectable={ false }
                    multiSelectable={ false }
                    height={ '350px' }
                    fixedHeader={ true }
                >
                    <TableHeader
                        displaySelectAll={ false }
                        adjustForCheckbox={ false }
                        enableSelectAll={ false }
                    >
                        <TableRow style={{ verticalAlign: 'middle' }}>
                            { tableHeaderColumns }
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        displayRowCheckbox={ false }
                    >
                        { tableBody }
                    </TableBody>
                </Table>

            </Dialog>
        );
    }
}

export default SensorAdvancedSettings;
