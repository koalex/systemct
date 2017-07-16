'use strict';

import styles from './Projects.styl';

import uuid from 'uuid';

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
import SelectField from 'material-ui/SelectField';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import UploadIcon                from 'material-ui/svg-icons/file/file-upload';
import DownloadIcon                from 'material-ui/svg-icons/file/file-download';
import VisibilityIcon                from 'material-ui/svg-icons/action/visibility';
import PlayIcon                from 'material-ui/svg-icons/av/play-arrow';
import StopIcon                from 'material-ui/svg-icons/av/stop';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';

import WifiIcon                from 'material-ui/svg-icons/notification/wifi';
import NewProjectIcon                from 'material-ui/svg-icons/file/create-new-folder';
import EditIcon                from 'material-ui/svg-icons/editor/mode-edit';
import SaveIcon                from 'material-ui/svg-icons/content/save';
import DeleteIcon                from 'material-ui/svg-icons/action/delete';
import DeleteForeverIcon                from 'material-ui/svg-icons/action/delete-forever';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
// import MoreHorizIcon from 'material-ui/svg-icons/navigation/more-horiz';
import SensorIcon           from 'material-ui/svg-icons/hardware/memory';
import DevicesIcon          from 'material-ui/svg-icons/device/devices';
import ArrDownIcon          from 'material-ui/svg-icons/navigation/arrow-downward';
import ListIcon          from 'material-ui/svg-icons/action/list';
import { blue300, indigo900, grey400, green500, cyan500 } from 'material-ui/styles/colors';

import Dropzone from 'react-dropzone'
import Dialog from 'material-ui/Dialog';
import TextField                from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Snackbar                 from 'material-ui/Snackbar';
import FloatingActionButton     from 'material-ui/FloatingActionButton';
import PlusIcon                 from 'material-ui/svg-icons/content/add';
import PlusCircleIcon                 from 'material-ui/svg-icons/content/add-circle-outline';
import ImageIcon                 from 'material-ui/svg-icons/image/image';
import CircularProgress                                     from 'material-ui/CircularProgress';

import IEEE754          from '../../../libs/IEEE754_client.js';
import IpPort           from '../IpPort';
import RegisterAdd      from '../RegisterAdd';
import RegisterWrite    from '../RegisterWrite';

import { connect }              from 'react-redux';
import { projectDeviceSensorEdit, dictionaryProjectSelect, deviceSensorDelete, deviceSensorEdit, addDeviceSensor, setCurrentDevice, dictionaryCreate, dictionaryRead, dictionaryUpdate, dictionaryDelete, dictionaryExport, dictionaryImport, modalShow, modalHide, inputChange, dispatch } from '../../actions';
import { DICTIONARY, UGO, SENSOR, DEVICE, PROJECT, MODAL, _DROP, _CREATE, _UPDATE, _DELETE, _IMPORT, _SUCCESS, _ERROR, _CLEAR, _HIDE } from '../../actions/constants';


@connect(
    state => {
        const { ugo, sensors, devices, projects, modal, common } = state;
        return { ugo, sensors, devices, projects, modal, common };
    }, { projectDeviceSensorEdit, dictionaryProjectSelect, deviceSensorDelete, deviceSensorEdit, addDeviceSensor, setCurrentDevice, dictionaryCreate, dictionaryRead, dictionaryUpdate, dictionaryDelete, dictionaryExport, dictionaryImport, modalShow, modalHide, inputChange, dispatch }
)
export default class _Device extends Component {
    constructor(...props) {
        super(...props);
        this.state = { tableHeight: '0px', selectedDevice: null, registerDialogIsOpen: false, r: '', s: '', ipDialogIsOpen: false };
    }
    static propTypes = {
        ugo: PropTypes.object,
        sensors: PropTypes.object,
        devices: PropTypes.object,
        projects: PropTypes.object,

        projectDeviceSensorEdit: PropTypes.func,
        dictionaryProjectSelect: PropTypes.func,
        deviceSensorDelete: PropTypes.func,
        deviceSensorEdit: PropTypes.func,
        addDeviceSensor: PropTypes.func, // FIXME: remove
        setCurrentDevice: PropTypes.func,
        dictionaryCreate: PropTypes.func,
        dictionaryRead: PropTypes.func,
        dictionaryDelete: PropTypes.func,
        dictionaryUpdate: PropTypes.func,
        dictionaryExport: PropTypes.func,
        dictionaryImport: PropTypes.func,
        inputChange: PropTypes.func,

        modalShow: PropTypes.func,
        modalHide: PropTypes.func,
        dispatch: PropTypes.func,
        socket: PropTypes.object
    };

    socketListensers = {
        'READ_HOLDING_REGISTERS_SUCCESS': data => {
            this.props.dispatch({
                type: 'READ_HOLDING_REGISTERS_SUCCESS',
                payload: data
            });
        },
        'READ_HOLDING_REGISTERS_ERROR': data => {
            this.props.dispatch({
                type: 'READ_HOLDING_REGISTERS_ERROR',
                payload: data
            });
        },
        [PROJECT + MODAL + _HIDE]: () => {
            this.props.modalHide({ modalType: 'ADD_PROJECT' })
        },
        [DICTIONARY + PROJECT + _CREATE + _SUCCESS]: project => {
            this.props.dispatch({
                type: DICTIONARY + PROJECT + _CREATE + _SUCCESS,
                payload: project
            });
        },
        [DICTIONARY + DEVICE + _CREATE + _SUCCESS]: device => {
            this.props.dispatch({
                type: DICTIONARY + DEVICE + _CREATE + _SUCCESS,
                payload: device
            });
        },
        [DICTIONARY + SENSOR + _CREATE + _SUCCESS]: device => {
            this.props.dispatch({
                type: DICTIONARY + SENSOR + _CREATE + _SUCCESS,
                payload: device
            });
        },
        [DICTIONARY + DEVICE + _UPDATE + _SUCCESS]: device => {
            this.props.dispatch({
                type: DICTIONARY + DEVICE + _UPDATE + _SUCCESS,
                payload: device
            });
        },
        [DICTIONARY + PROJECT + _UPDATE + _SUCCESS]: project => {
            this.props.dispatch({
                type: DICTIONARY + PROJECT + _UPDATE + _SUCCESS,
                payload: project
            });

            setTimeout(() => {
                this.setState(Object.assign({}, this.state, {
                    registerError: null,
                    s: null,
                    registerDialogIsOpen: false,
                    r: null
                }))
            }, 500)
        },
        [DICTIONARY + SENSOR + _UPDATE + _SUCCESS]: device => {
            this.props.dispatch({
                type: DICTIONARY + SENSOR + _UPDATE + _SUCCESS,
                payload: device
            });
        },
        [DICTIONARY + PROJECT + _DELETE + _SUCCESS]: response => {
            this.props.dispatch({
                type: DICTIONARY + PROJECT + _DELETE + _SUCCESS,
                payload: response
            });
        },

        [DICTIONARY + DEVICE + _DELETE + _SUCCESS]: response => {
            this.props.dispatch({
                type: DICTIONARY + DEVICE + _DELETE + _SUCCESS,
                payload: response
            });
        },
        [DICTIONARY + SENSOR + _DELETE + _SUCCESS]: response => {
            this.props.dispatch({
                type: DICTIONARY + SENSOR + _DELETE + _SUCCESS,
                payload: response
            });
        },
        [DICTIONARY + DEVICE + _IMPORT + _SUCCESS]: () => {
            this.props.dictionaryRead('device');
        },
        [DICTIONARY + SENSOR + _IMPORT + _SUCCESS]: () => {
            this.props.dictionaryRead('sensor');
        },
        [DICTIONARY + PROJECT + _IMPORT + _SUCCESS]: () => {
            this.props.dictionaryRead('project');
        }
    };

    componentDidMount () {
        const self = this;
        let resizeTimer;
        let tableHeight = parseInt(window.getComputedStyle(document.querySelector('.' + styles['projects-devices-detail'])).height) - 100 + 'px';

        window.addEventListener('resize', ev => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {

                tableHeight = parseInt(window.getComputedStyle(document.querySelector('.' + styles['projects-devices-detail'])).height) - 100 + 'px';
                self.setState(Object.assign({}, self.state, { tableHeight: tableHeight }));

            }, 150);
        });

        this.setState(Object.assign({}, this.state, { tableHeight: tableHeight }));

        if (!this.props.sensors.items.length) this.props.dictionaryRead('sensor');
        if (!this.props.devices.items.length) this.props.dictionaryRead('device');
        if (!this.props.projects.items.length) this.props.dictionaryRead('project');

        for (let ev in this.socketListensers) {
            this.props.socket.on(ev, this.socketListensers[ev]);
        }

    }

    componentWillUnmount () {
        for (let ev in this.socketListensers) {
            this.props.socket.removeListener(ev, this.socketListensers[ev]);
        }
    }

    readRegisters = sensorId => {
        let selectedDevice, registers, dataType, bytes;

        this.props.projects.selectedProject.devices.forEach(d => {
            if (this.state.selectedDevice._id == d._id) selectedDevice = d;
        });

        selectedDevice.sensors.forEach(s => {
            if (s._id === sensorId) {
                dataType = s.dataType;
                bytes = s.bytes;
                if (Array.isArray(s.registers) && s.registers.length) {
                    registers = s.registers;
                }
            }
        });

        if (!registers) return;
        this.props.socket.emit('READ_HOLDING_REGISTERS', {
            url: 'http://' + this.state.selectedDevice.ip + ':' + this.state.selectedDevice.port,
            deviceId: selectedDevice._id,
            sensorId: sensorId,
            dataType,
            bytes,
            registers
        });
    };

    /*componentDidUpdate(prevProps, prevState) {}*/
    /*componentWillReceiveProps (nextProps) {}*/
    /*shouldComponentUpdate (nextProps, nextState) { return true; }*/
    handleDrop = data => {
        this.props.dispatch({
            type: DICTIONARY + DEVICE +_DROP,
            data
        });
    };

    /*addSensor = sensor => {
        if (this.props.devices.device) {
            this.props.addDeviceSensor(sensor);
        }
    };*/



    dictionaryImport = data => {
        this.props.dictionaryImport({
            dictionary: 'device',
            skipSuccess: true,
            body: {
                files: data
            }
        });
    };

    inputChange = (data) => {
        let needToClearErrors = this.props.devices.error || Object.keys(this.props.devices.errors).length;

        if (needToClearErrors) this.props.dispatch({ type: _ERROR + _CLEAR });

        this.props.inputChange(data)
    };

    projectCreate = () => {
        let title = this.refs.newProjectTitle.input.value;

        let data = {
            dictionary: 'project',
            body: {
                title
            },
            skipSuccess: true
        };
        this.props.dictionaryCreate(data);

    };

    projectUpdate = project => {

        project.devices.forEach(d => {
            d.sensors.forEach(s => {
                s.registers.forEach(r => r != null && r != undefined)
            })
        });

        let data = {
            projectId: project._id,
            dictionary: 'project',
            body: project,
            skipSuccess: true
        };

        this.props.dictionaryUpdate(data);
    };

    addSensorToProjectDevice = sensor => {
        let projectUpdated = cloneProject(this.props.projects.selectedProject);
        let _sensor = Object.assign(sensor);
        _sensor._id = uuid.v1();
        _sensor.registers = [];
        if (!_sensor.dataType) _sensor.dataType = 'Float';
        if (!_sensor.permission) _sensor.permission = 'RW';

        projectUpdated.devices.forEach(d => {
            if (d._id === this.state.selectedDevice._id) {
                if (Array.isArray(d.sensors)) {
                    d.sensors.push(_sensor)
                } else {
                    d.sensors = [_sensor]
                }
            }
        });

        this.projectUpdate(projectUpdated);
    };

    deviceIpSave = dataObj => {
        // deviceIP
        let projectUpdated = cloneProject(this.props.projects.selectedProject);

        let nextState = Object.assign({}, this.state, {
            ipDialogIsOpen: false
        });

        projectUpdated.devices.forEach(d => {
            if (d._id === this.state.selectedDevice._id) {
                d.ip    = dataObj.ip;
                d.port  = dataObj.port;
                nextState.selectedDevice.ip   = dataObj.ip;
                nextState.selectedDevice.port = dataObj.port;
            }
        });

        this.projectUpdate(projectUpdated);

        this.setState(nextState);
    };

    saveSensor = sensor => {
        let projectUpdated = cloneProject(this.props.projects.selectedProject);
        projectUpdated.devices.forEach(d => {
            d.sensors.forEach(s => {
                if (s._id === sensor._id) {
                    if (this.state[s._id + 'sensorDataType']) {
                        s.dataType = this.state[s._id + 'sensorDataType'];
                    }
                    if (this.state[s._id + 'sensorMeasure']) {
                        s.measure = this.state[s._id + 'sensorMeasure'];
                    }
                    if (this.state[s._id + 'sensorNameShort']) {
                        // s.name_short = this.state[s._id + 'sensorNameShort'];
                        s.name_short = this.refs[s._id + 'sensorNameShort'].input.value;
                    }
                    if (this.state[s._id + 'sensorNameDispatch']) {
                        // s.name_dispatch = this.state[s._id + 'sensorNameDispatch'];
                        s.name_dispatch = this.refs[s._id + 'sensorNameDispatch'].input.refs.input.value;
                    }
                    if (this.state[s._id + 'sensorBytes']) {
                        s.bytes = this.state[s._id + 'sensorBytes'];
                    }
                    if (this.state[s._id + 'sensorPermission']) {
                        s.permission = this.state[s._id + 'sensorPermission'];
                    }
                }
            });
        });

        this.projectUpdate(projectUpdated);
        this.setState(Object.assign({}, this.state, {
            [sensor._id + 'sensorDataType']: null,
            [sensor._id + 'sensorBytes']: null,
            [sensor._id + 'sensorPermission']: null,
            [sensor._id + 'sensorMeasure']: null
        }))
    };


    addDeviceToProject = device => {
        let deviceCopy = Object.assign({}, device, {
            _id: uuid.v1()
        });

        if (Array.isArray(deviceCopy.sensors) && deviceCopy.sensors.length) {
            deviceCopy.sensors = deviceCopy.sensors.map(s => {
                return Object.assign({}, s, {
                    _id: uuid.v1(),
                    registers: Array.isArray(s.registers) && s.registers.length ? s.registers.map(r => r) : []
                })
            })
        }

        let projectUpdated = cloneProject(this.props.projects.selectedProject);

        projectUpdated.devices.push(deviceCopy);

        this.projectUpdate(projectUpdated);

    };

    removeDeviceFromProject = device => {
        let projectUpdated = cloneProject(this.props.projects.selectedProject);

        projectUpdated.devices = projectUpdated.devices.filter(d => d._id !== device._id);

        this.projectUpdate(projectUpdated);
    };

    removeDeviceSensorFromProject = sensor => {
        let projectClone = cloneProject(this.props.projects.selectedProject);
        // this.state.selectedDevice
        projectClone.devices.forEach(device => {
            if (this.state.selectedDevice._id === device._id) {
                device.sensors = device.sensors.filter(_sensor => {
                    return _sensor._id !== sensor._id
                });
            }
        });

        this.projectUpdate(projectClone);
    };

    removeRegistryFromProjectDeviceSensor = (sensor, r) => {
        let projectClone = cloneProject(this.props.projects.selectedProject);
        // this.state.selectedDevice
        projectClone.devices.forEach(device => {
            if (this.state.selectedDevice._id === device._id) {
                device.sensors.forEach(_sensor => {
                    if (_sensor._id === sensor._id) {
                        _sensor.registers = _sensor.registers.filter(_r => _r !== r)
                    }
                });
            }
        });

        this.projectUpdate(projectClone);
    };

    writeToRegistry = () => {
        this.setState(Object.assign({}, this.state, {
            registerError: null,
            s: null,
            registerDialogIsOpen: false,
            r: null
        }))
    };

    addRegistryToSensor = rv => {
        let projectClone = cloneProject(this.props.projects.selectedProject);
        // this.state.selectedDevice
        projectClone.devices.forEach(device => {
            if (this.state.selectedDevice._id === device._id) {
                device.sensors.forEach(sensor => {
                    if (this.state.s._id === sensor._id) {
                        sensor.registers.push(rv || this.refs.registryTitle.input.value);
                        if (this.state[sensor._id + 'sensorDataType']) sensor.dataType = this.state[sensor._id + 'sensorDataType'];
                    }
                });
            }
        });

        // dataType

        /*onChange={ (event, index, value) => {
            this.setState(Object.assign({}, this.state, {
                [s._id + 'sensorDataType']: value
            }))
        } }*/


        // RW / R / W
        /*onChange={ (event, index, value) => {
            this.setState(Object.assign({}, this.state, {
                [s._id + 'sensorPermission']: value
            }))
        } }*/

        this.projectUpdate(projectClone);
    };

    writeSingleRegister = rv => {
        const self        = this;
        let registerValue = rv || this.refs.registryTitle.input.value;

        let selectedDevice, bytes, dataType;

        this.props.projects.selectedProject.devices.forEach(d => {
            if (this.state.selectedDevice._id == d._id) selectedDevice = d;
        });

        selectedDevice.sensors.forEach(s => {
            if (s._id === this.state.s._id) {
                bytes = s.bytes;
                dataType = s.dataType;
            }
        });

        this.props.socket.emit('WRITE_HOLDING_REGISTERS', {
            url: 'http://' + selectedDevice.ip,
            deviceId: selectedDevice._id,
            sensorId: self.state.s._id,
            r: self.state.r,
            v: Number(registerValue),
            dataType,
            bytes: bytes
        });
    };

    startStopProject = v => {

        let projectUpdated = cloneProject(this.props.projects.selectedProject);

        projectUpdated.active = v;

        this.projectUpdate(projectUpdated);
    };

    dictionaryImport = data => {
        this.props.dictionaryImport({
            dictionary: 'projects',
            skipSuccess: true,
            body: {
                files: data
            }
        });
    };

    render () {
        let reducer = this.props.projects;
        const devices = this.props.devices.items;
        let selectedDevice;



        if (this.state.selectedDevice) {
            if (this.props.projects.selectedProject._id && Array.isArray(this.props.projects.selectedProject.devices) && this.props.projects.selectedProject.devices.length) {
                for (let i = 0, l = this.props.projects.selectedProject.devices.length; i < l; i++) {
                    if (this.props.projects.selectedProject.devices[i]._id === this.state.selectedDevice._id) {
                        selectedDevice = this.props.projects.selectedProject.devices[i];
                        break;
                    }
                }
            }
        }


        const iconButtonElement = (
            <IconButton
                touch={ true }
                tooltip="дополнительно"
                tooltipPosition="top-left"
            >
                <MoreVertIcon color={ grey400 } />
            </IconButton>
        );
        const ProjectsIconButton = (
            <IconButton
                touch={ true }
            >
                <ListIcon />
            </IconButton>
        );
        const AddProjectIconButton = (
            <IconButton
                touch={ true }

            >
                <MoreVertIcon />
            </IconButton>
        );

        const AddDeviceMenu = (
            <IconMenu
                style={{ float: 'right' }}
                iconButtonElement={<IconButton
                touch={ true }
            >
                <PlusIcon color={ grey400 } />
            </IconButton>}>
                { devices.map(d => {
                    return <MenuItem key={ d._id } onTouchTap={ () => { this.addDeviceToProject(d); } }>{ d.title }</MenuItem>
                }) }
            </IconMenu>
        );

        const rightIconMenu = device => (
            <IconMenu iconButtonElement={iconButtonElement}>
                <MenuItem onTouchTap={ () => {
                    this.setState(Object.assign({}, this.state, {
                        ipDialogIsOpen: true
                    }))
                } } rightIcon={<WifiIcon  />}>настроить IP</MenuItem>
                <MenuItem
                    rightIcon={<ArrowDropRight />}
                    menuItems={ this.props.sensors.items.map(s => <MenuItem onTouchTap={ () => { this.addSensorToProjectDevice(s); } } primaryText={ s.title } />) }
                    >
                    добавить датчик
                </MenuItem>
                <MenuItem onTouchTap={ () => { this.removeDeviceFromProject(device); }} rightIcon={<DeleteIcon  />}>удалить</MenuItem>
            </IconMenu>
        );

        const newProjectDialogActions = [
            <FlatButton
                label="Создать"
                primary={ true }
                keyboardFocused={ false }
                onTouchTap={ this.projectCreate }
                disabled={ reducer.isLoading }
            />,
            <FlatButton
                label="Отмена"
                secondary={ true }
                keyboardFocused={ false }
                onTouchTap={ () => { this.props.modalHide({ modalType: 'ADD_PROJECT' }) } }
                disabled={ reducer.isLoading }
            />
        ];



        const tableRows = selectedDevice && Array.isArray(selectedDevice.sensors) && selectedDevice.sensors.length ? selectedDevice.sensors.map((s, i) => {
            return <TableRow key={ s._id + i }>
                {/*1*/}
                <TableRowColumn
                    style={{ overflow: 'visible', paddingLeft: 0, width: '50px' }}
                >
                    { s.editMode ?
                        <IconButton onTouchTap={ () => { this.saveSensor(s); } }><SaveIcon/></IconButton>
                        :
                        <IconButton
                            tooltip="изменить"
                            tooltipPosition="bottom-right"
                            onTouchTap={ () => { this.props.projectDeviceSensorEdit(s); } }><EditIcon/>
                        </IconButton>
                    }
                </TableRowColumn>
                {/*2*/}
                <TableRowColumn style={{ paddingLeft: 0, paddingRight: 0, width: '140px' }}>
                    <div style={{ display: 'inline-block', textAlign: 'left' }}>
                        <img src={ s.img } alt=""/>
                        <br/>
                        <strong style={{ fontWeight: 'bold', textTransform: 'uppercase' }} title={ s.title }>
                            { s.title }
                        </strong>
                    </div>
                </TableRowColumn>
                {/*3*/}
                <TableRowColumn style={{ paddingLeft: '10px', width: '64px' }}>
                    <SelectField
                        disabled={ !s.editMode }
                        iconStyle={{ opacity: s.editMode ? 1 : 0, paddingRight: '0px', fill: '#000', textAlign: 'right' }}
                        underlineStyle={{ opacity: s.editMode ? 1 : 0 }}
                        onChange={ (event, index, value) => {
                            this.setState(Object.assign({}, this.state, {
                                [s._id + 'sensorMeasure']: value
                            }))
                        } }
                        name="sensorMeasure"
                        ref={ s._id + 'sensorMeasure' }
                        style={{ width: '64px', verticalAlign: 'bottom' }}
                        value={ this.state[s._id + 'sensorMeasure'] || s.measure }
                        defaultValue={ s.measure }
                    >
                        <MenuItem value={ ' ' } primaryText="" />
                        <MenuItem value={ 'А' } primaryText="А" />
                        <MenuItem value={ 'В' } primaryText="В" />
                        <MenuItem value={ 'Ом' } primaryText="Ом" />
                    </SelectField>
                </TableRowColumn>
                {/*4*/}
                <TableRowColumn style={{ width: '112px'}}>
                    <TextField
                        name="sensorNameShort"
                        ref={ s._id + 'sensorNameShort' }
                        defaultValue={ s.name_short }
                        disabled={ !s.editMode }
                        style={{ width: '100%'}}
                        underlineStyle={{ opacity: s.editMode ? 1 : 0 }}
                        onBlur={ () => {
                            this.setState(Object.assign({}, this.state, {
                                [s._id + 'sensorNameShort']: this.refs[s._id + 'sensorNameShort'].input.value
                            }))
                        } }
                    />
                </TableRowColumn>
                {/*5*/}
                <TableRowColumn
                    style={{ width: '112px'}}>
                    <TextField
                        title={ s.name_dispatch }
                        name="sensorNameDispatch"
                        ref={ s._id + 'sensorNameDispatch' }
                        defaultValue={ s.name_dispatch }
                        disabled={ !s.editMode }
                        style={{ width: '100%'}}
                        underlineStyle={{ opacity: s.editMode ? 1 : 0 }}
                        onBlur={ () => {
                            this.setState(Object.assign({}, this.state, {
                                [s._id + 'sensorNameDispatch']: this.refs[s._id + 'sensorNameDispatch'].input.refs.input.value
                            }))
                        } }
                        multiLine={ true }
                        rowsMax={4}
                    />
                </TableRowColumn>
                {/*6*/}
                <TableRowColumn style={{ width: '90px'}}>
                    <SelectField
                        disabled={ !s.editMode }
                        style={{ width: '165px', verticalAlign: 'bottom' }}
                        iconStyle={{ opacity: s.editMode ? 1 : 0, paddingLeft: '0px', fill: '#000', textAlign: 'center' }}
                        underlineStyle={{ opacity: s.editMode ? 1 : 0 }}
                        onChange={ (event, index, value) => {
                            this.setState(Object.assign({}, this.state, {
                                [s._id + 'sensorDataType']: value
                            }))
                        } }
                        name="sensorDataType"
                        ref={ s._id + 'sensorDataType' }
                        value={ this.state[s._id + 'sensorDataType'] || s.dataType }
                        defaultValue={ s.dataType || Object.keys(IEEE754)[0] }
                    >
                        { Object.keys(IEEE754).map(v => <MenuItem key={ v } value={ v } primaryText={ v } />) }
                    </SelectField>
                </TableRowColumn>
                {/*8*/}
                <TableRowColumn style={{ width: '60px' }}>
                    <SelectField
                        disabled={ !s.editMode }
                        style={{ width: '65px', verticalAlign: 'bottom' }}
                        iconStyle={{ opacity: s.editMode ? 1 : 0, paddingRight: '0px', fill: '#000', textAlign: 'right' }}
                        underlineStyle={{ opacity: s.editMode ? 1 : 0 }}
                        defaultValue={ s.permission }
                        value={ this.state[s._id + 'sensorPermission'] || s.permission }
                        onChange={ (event, index, value) => {
                            this.setState(Object.assign({}, this.state, {
                                [s._id + 'sensorPermission']: value
                            }))
                        } }
                    >
                        <MenuItem value={ 'R' } primaryText="R" />
                        <MenuItem value={ 'RW' } primaryText="RW" />
                        <MenuItem value={ 'W' } primaryText="W" />
                    </SelectField>
                </TableRowColumn>
                {/*9*/}
                <TableRowColumn style={{ overflow: 'visible', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-block', height: '100%', verticalAlign: 'top', whiteSpace: 'wrap' }}>
                        <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                            { s.editMode ? <IconButton
                                tooltip="добавить регистр"
                                tooltipPosition="bottom-left"
                                style={{ position: 'relative', zIndex: 999, paddingLeft: 0 }}
                                onTouchTap={ () => {
                                    this.setState(Object.assign({}, this.state, {
                                        registryMode: 'add',
                                        registerDialogIsOpen: true,
                                        r: null,
                                        s
                                    }));
                                } }>
                                <PlusCircleIcon/>
                            </IconButton> : ((s.permission !== 'W') && Array.isArray(s.registers) && s.registers.length) ?
                                <IconButton
                                    tooltip="прочитать"
                                    tooltipPosition="bottom-left"
                                    style={{ position: 'relative', zIndex: 999, paddingLeft: 0 }}
                                    onTouchTap={ () => { this.readRegisters(s._id) } }>
                                    <VisibilityIcon/>
                                </IconButton>
                                :
                                <div
                                    style={{ padding: '12px' }}
                                >
                                    &nbsp;
                                </div> }
                        </div>
                    </div>
                    <div style={{ display: 'inline-block', whiteSpace: 'wrap' }}>
                        <Table selectable={ false } style={{ width: 'auto', backgroundColor: 'transparent' }}>
                            <TableBody
                                displayRowCheckbox={ false }
                            >
                                {
                                    Array.isArray(s.registers) && s.registers.length ? s.registers.map((r, i) => {
                                        return <TableRow key={ r + i } style={{ verticalAlign: 'middle' }}>
                                            <TableRowColumn
                                                style={{ paddingLeft: 0, paddingRight: 0 }}
                                            >
                                                <Chip
                                                    title='регистр'
                                                    style={{ margin: '5px 5px 5px 0' }}
                                                    onRequestDelete={ s.editMode ? () => {
                                                        this.removeRegistryFromProjectDeviceSensor(s, r)
                                                    } : null }
                                                    onTouchTap={ () => {
                                                        if (!s.editMode && s.permission !== 'R') {
                                                            this.setState(Object.assign({}, this.state, {
                                                                registryMode: null,
                                                                registerDialogIsOpen: true,
                                                                r: r.substring(),
                                                                s
                                                            }));
                                                        }
                                                    } }
                                                >
                                                    <span
                                                        style={{ color: '#000' }}
                                                    >
                                                        {r}
                                                    </span>
                                                </Chip>
                                                <div></div>
                                                { s.registersValues && s.registersValues[r] != undefined && s.registersValues[r] != null ?
                                                    (s.registersValues[r] == 'ошибка' || s.registersValues[r] == '> 9007199254740991') ?
                                                        <span style={{ color: 'red' }}>{ s.registersValues[r] }</span>
                                                        : Number(s.registersValues[r].toFixed(2))
                                                    : null
                                                }

                                            </TableRowColumn>
                                        </TableRow>
                                    }) : null
                                }

                            </TableBody>
                        </Table>
                    </div>

                </TableRowColumn>
                {/*10*/}
                <TableRowColumn
                    style={{ overflow: 'visible', paddingLeft: 0, paddingRight: 0, width: '48px' }}
                >
                    <IconButton
                        tooltip="удалить"
                        tooltipPosition="bottom-left"
                        onTouchTap={ () => { this.removeDeviceSensorFromProject(s) } }>
                        <DeleteIcon/>
                    </IconButton>
                </TableRowColumn>
            </TableRow> }) : null ;
        let dictionaryDropzoneRef;

        return (
            <div className={ styles['projects-container'] }>
                <IpPort
                    disabled={ reducer.isLoading }
                    ip={ this.state.selectedDevice ? this.state.selectedDevice.ip : null }
                    port={ this.state.selectedDevice ? this.state.selectedDevice.port : null }
                    open={ this.state.ipDialogIsOpen }
                    close={ () => {
                        this.setState(Object.assign({}, this.state, {
                            ipDialogIsOpen: false
                        }))
                    } }
                    submit={ this.deviceIpSave }
                />
                <RegisterAdd
                    disabled={ reducer.isLoading }
                    registers={ this.state.s && Array.isArray(this.state.s.registers) ? this.state.s.registers : [] }
                    open={ this.state.registerDialogIsOpen && this.state.registryMode === 'add' }
                    close={ () => {
                        this.setState(Object.assign({}, this.state, {
                            registerError: null,
                            currentSensor: null,
                            registerDialogIsOpen: false,
                            registerValue: null
                        }));
                    } }
                    submit={ this.addRegistryToSensor }
                />
                <RegisterWrite
                    disabled={ reducer.isLoading }
                    register={ this.state.r }
                    dataType={ this.state.s && this.state.s.dataType ? this.state.s.dataType : ''  }
                    socket={ this.props.socket }
                    open={ this.state.registerDialogIsOpen && this.state.registryMode != 'add' }
                    close={ () => {
                        this.setState(Object.assign({}, this.state, {
                            registerError: null,
                            currentSensor: null,
                            registerDialogIsOpen: false,
                            registerValue: null
                        }));
                    } }
                    submit={ this.writeSingleRegister }
                />

                {/*Failed prop type: The prop `dataType` is marked as required in `RegisterWrite`, but its value is `undefined`*/}

                <Dialog actions={ newProjectDialogActions }
                        modal={ true }
                        contentStyle={{ width: '304px' }}
                        autoScrollBodyContent={ false }
                        open={ reducer.newProject.isOpen }
                >
                    <div style={{ height: '50px' }}>
                        <TextField
                            autoFocus={ true }
                            onKeyPress={ ev => {
                                if (ev.key === 'Enter') {
                                    ev.preventDefault();
                                    this.projectCreate();
                                }
                            }}
                            name="title"
                            ref="newProjectTitle"

                            onBlur={ () => { this.props.inputChange({
                                componentName: 'addProject',
                                newProjectTitle: this.refs.newProjectTitle.input.value
                            }) }}
                            hintText='введите название проекта'
                            errorText={ reducer.errors['title'] || reducer.error }
                        ></TextField>
                    </div>
                </Dialog>
                <div style={{ display: 'flex', flexDirection: 'column', flexBasis: '238px', maxWidth: '238px' }}>
                    <h3 className={ styles['projects-project-devices__title'] }>
                        <div style={{ verticalAlign: 'top', display: 'inline-block', height: '48px' }}>Устройства</div>
                        { (reducer.selectedProject && Array.isArray(reducer.items) && reducer.items.length) ? AddDeviceMenu : <IconButton
                            style={{ float: 'right' }}
                            disabled={true}
                        >
                            <PlusIcon
                                color={grey400}
                            ></PlusIcon>
                        </IconButton> }
                        <div style={{ clear: 'both' }}></div>
                    </h3>
                    <List className={ styles['projects-project-devices'] }>
                        {reducer.selectedProject.devices.map((d, i) => <ListItem
                            onTouchTap={ () => {
                                {/*this.selectDevice(d);*/}
                                this.setState( Object.assign({}, this.state, { selectedDevice: d }) )
                            }}
                            key={ d._id }
                            className={ styles['projects-project-devices-list-item'] }
                            leftAvatar={<Avatar src={ d.img } />}
                            rightIcon={ rightIconMenu(d) }
                            secondaryTextLines={ 1 }
                            primaryText={
                                <p>{ d.title }</p>
                            }
                            secondaryText={
                                <p title={d.sensors && d.sensors.length ? d.sensors.map(s => s.title).join(', ') : null}>
                                    { d.sensors && d.sensors.length ? d.sensors.map(s => s.title).join(', ') : ' ' }
                                </p>
                            }
                        />
                        )}
                    </List>
                </div>
                <div className={ styles['projects-delim'] }></div>

                <div className={ styles['projects-devices-detail'] }>
                    <h3 className={ styles['projects-project-devices__title'] } style={{ position: 'relative' }}>
                        <span style={{ verticalAlign: 'top' }}>{ reducer.selectedProject.title }</span>
                        <span>{ reducer.selectedProject && reducer.selectedProject._id ?
                            !reducer.selectedProject.active ? <IconButton
                                onTouchTap={ () => {
                                    this.startStopProject(true);
                                } }
                                tooltip="ЗАПУСТИТЬ ПРОЕКТ"><PlayIcon/></IconButton> : <IconButton onTouchTap={() => {
                                this.startStopProject(false);
                            }} tooltip="ОСТАНОВИТЬ ПРОЕКТ"><StopIcon/></IconButton>
                            : null }</span>
                        <div style={{ position: 'absolute', right: '12px', top: 0 }}>
                            <IconButton
                                tooltip="импорт проектов"
                                tooltipPosition="bottom-left"
                                style={{ alignSelf: 'center' }}
                                onTouchTap={ () => { dictionaryDropzoneRef.open() } }  className={ styles['sensor-upload-btn'] }>
                                <Dropzone
                                    style={{ display: 'none' }}
                                    disabled={ reducer.isLoading }
                                    multiple={ false }
                                    ref={ node => { dictionaryDropzoneRef = node; } }
                                    accept=".tar"
                                    onDrop={ this.dictionaryImport }>

                                </Dropzone>
                            >
                                <UploadIcon/>
                            </IconButton>

                            <IconButton
                                disabled={!Array.isArray(reducer.items) || !reducer.items.length}
                                tooltip="экспорт проектов"
                                tooltipPosition="bottom-left"
                                style={{ alignSelf: 'center' }}
                                onTouchTap={ () => { this.props.dictionaryExport('projects', 'dictionary_projects.tar'); } }>
                                <DownloadIcon/>
                            </IconButton>

                            { Array.isArray(reducer.items) && reducer.items.length ? <IconMenu
                                height={ 200 }
                                iconButtonElement={ ProjectsIconButton }
                                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                                targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                            >
                                { reducer.items.map(p => {
                                    return <MenuItem key={p._id} onTouchTap={ () => { this.props.dictionaryProjectSelect(p._id); } }>{ p.title }</MenuItem>
                                }) }
                            </IconMenu> : <IconButton
                                disabled={true}
                            >
                                <ListIcon />
                            </IconButton> }


                            <IconMenu
                                iconButtonElement={ AddProjectIconButton }
                                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                                targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                            >
                                <MenuItem onTouchTap={ () => { this.props.modalShow({ modalType: 'ADD_PROJECT' }) } } leftIcon={<NewProjectIcon/>}>создать проект</MenuItem>
                                { reducer.selectedProject._id ? <MenuItem onTouchTap={ () => { this.props.dictionaryDelete({ dictionary: 'project', projectId: reducer.selectedProject._id }) } } leftIcon={<DeleteForeverIcon/>}>удалить текущий проект</MenuItem> : null }

                            </IconMenu>

                        </div>

                    </h3>
                    <div style={{ minWidth: 1100, overflow: 'auto' }}>
                        <div>
                            <Table
                                className={ styles['projects-project-devices__table'] }
                                height={ this.state.tableHeight || "0px" }
                                fixedHeader={ true }
                                selectable={ false }
                                multiSelectable={ false }
                            >
                                <TableHeader
                                    displaySelectAll={false}
                                    adjustForCheckbox={false}
                                    enableSelectAll={false}
                                >

                                    <TableRow style={{ verticalAlign: 'middle' }}>
                                        <TableHeaderColumn
                                            style={{ paddingLeft: 0, width: '50px' }}
                                            rowSpan="2"
                                        >
                                            {/*Редактировать/Сохранить*/}
                                        </TableHeaderColumn>
                                        <TableHeaderColumn
                                            style={{ paddingLeft: 0, paddingRight: 0, width: '140px' }}
                                            rowSpan="2" tooltip="Название датчика"
                                        >
                                            Датчик
                                        </TableHeaderColumn>
                                        <TableHeaderColumn
                                            style={{ paddingLeft: '10px', width: '64px' }}
                                            rowSpan="2" tooltip="Единицы измерения"
                                        >
                                            Единицы <br/>
                                            измерения
                                        </TableHeaderColumn>
                                        <TableHeaderColumn style={{ width: '272px', textAlign: 'center' }} colSpan="2">
                                            Наименование
                                        </TableHeaderColumn>
                                        <TableHeaderColumn
                                            style={{ width: '90px'}}
                                            rowSpan="2" tooltip="Тип данных"
                                        >
                                            Тип данных
                                        </TableHeaderColumn>
                                        <TableHeaderColumn style={{ width: '60px' }} rowSpan="2" tooltip="R - чтение; W - запись; RW - чтение и запись" >
                                            Доступ
                                        </TableHeaderColumn>
                                        <TableHeaderColumn colSpan="2" rowSpan="2" tooltip="Список регистров датчика">
                                            Регистры
                                        </TableHeaderColumn>
                                    </TableRow>

                                    <TableRow style={{ verticalAlign: 'middle' }}>
                                        <TableHeaderColumn tooltip="Краткое наименование" >
                                            Краткое
                                        </TableHeaderColumn>
                                        <TableHeaderColumn tooltip="Диспетчерское наименование" >
                                            Диспетчерское
                                        </TableHeaderColumn>
                                    </TableRow>

                                </TableHeader>
                                <TableBody
                                    displayRowCheckbox={false}
                                    deselectOnClickaway={false}
                                    showRowHover={false}
                                    stripedRows={true}
                                    style={{ verticalAlign: 'middle' }}
                                >
                                    {tableRows}
                                </TableBody>
                            </Table>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

function cloneProject (project) {
    return Object.assign({}, project, {
        devices: Array.isArray(project.devices) && project.devices.length ? project.devices.map(d => {
            return Object.assign({}, d, {
                sensors: Array.isArray(d.sensors) && d.sensors.length ? d.sensors.map(s => {
                    return Object.assign({}, s, {
                        registers: Array.isArray(s.registers) && s.registers.length ? s.registers.filter(r => r != null && r != undefined) : []
                    });
                }) : []
            });
        }) : []
    })
}