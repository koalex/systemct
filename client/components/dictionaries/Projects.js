'use strict';

import styles from './Projects.styl';

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
import UploadIcon                from 'material-ui/svg-icons/file/file-upload';
import DownloadIcon                from 'material-ui/svg-icons/file/file-download';
import VisibilityIcon                from 'material-ui/svg-icons/action/visibility';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';

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
import { blue300, indigo900, grey400, green500 } from 'material-ui/styles/colors';

import Dropzone from 'react-dropzone'
import Dialog from 'material-ui/Dialog';
import TextField                from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Snackbar                 from 'material-ui/Snackbar';
import FloatingActionButton     from 'material-ui/FloatingActionButton';
import PlusIcon                 from 'material-ui/svg-icons/content/add';
import ImageIcon                 from 'material-ui/svg-icons/image/image';
import CircularProgress                                     from 'material-ui/CircularProgress';

import { connect }              from 'react-redux';
import { deviceSensorDelete, deviceSensorEdit, addDeviceSensor, setCurrentDevice, dictionaryCreate, dictionaryRead, dictionaryUpdate, dictionaryDelete, dictionaryExport, dictionaryImport, modalShow, modalHide, inputChange, dispatch } from '../../actions';
import { DICTIONARY, UGO, SENSOR, DEVICE, PROJECT, MODAL, _DROP, _CREATE, _UPDATE, _DELETE, _IMPORT, _SUCCESS, _ERROR, _CLEAR, _HIDE } from '../../actions/constants';


@connect(
    state => {
        const { ugo, sensors, devices, modal, common } = state;
        return { ugo, sensors, devices, modal, common };
    }, { deviceSensorDelete, deviceSensorEdit, addDeviceSensor, setCurrentDevice, dictionaryCreate, dictionaryRead, dictionaryUpdate, dictionaryDelete, dictionaryExport, dictionaryImport, modalShow, modalHide, inputChange, dispatch }
)
export default class _Device extends Component {
    constructor(...props) {
        super(...props);
        this.state = { tableHeight: 0 };
    }
    static propTypes = {
        ugo: PropTypes.object,
        sensors: PropTypes.object,
        devices: PropTypes.object,

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

        modalHide: PropTypes.func,
        dispatch: PropTypes.func,
        socket: PropTypes.object
    };

    socketListensers = {
        [DEVICE + MODAL + _HIDE]: () => {
            this.props.modalHide({ modalType: 'ADD_DEVICE' })
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
        [DICTIONARY + SENSOR + _UPDATE + _SUCCESS]: device => {
            this.props.dispatch({
                type: DICTIONARY + SENSOR + _UPDATE + _SUCCESS,
                payload: device
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
                self.setState({ tableHeight });

            }, 150);
        });

        this.setState({ tableHeight });

        if (!this.props.sensors.items.length) this.props.dictionaryRead('sensor');
        if (!this.props.devices.items.length) this.props.dictionaryRead('device');

        for (let ev in this.socketListensers) {
            this.props.socket.on(ev, this.socketListensers[ev]);
        }
    }

    componentWillUnmount () {
        for (let ev in this.socketListensers) {
            this.props.socket.removeListener(ev, this.socketListensers[ev]);
        }
    }

    /*componentDidUpdate(prevProps, prevState) {}*/
    /*componentWillReceiveProps (nextProps) {}*/
    /*shouldComponentUpdate (nextProps, nextState) { return true; }*/
    handleDrop = data => {
        this.props.dispatch({
            type: DICTIONARY + DEVICE +_DROP,
            data
        });
    };

    addSensor = sensor => {
        if (this.props.devices.device) {
            this.props.addDeviceSensor(sensor);
        }
    };

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

    submit = device => {
        let title, files;

        if (! this.props.devices.device._id) {
            title = this.refs.deviceTitle.input.value;
        }
        files = this.props.devices.device.files;


        let data = {
            dictionary: 'device',
            body: {
                title
            },
            skipSuccess: true
        };

        if (files && files.length) data.body.files = files;
        if (this.props.devices.device._id) {
            data.deviceId = this.props.devices.device._id;
            data.body = this.props.devices.device;
            this.props.dictionaryUpdate(data);
        } else {
            this.props.dictionaryCreate(data);
        }
    };

    render () {
        const reducer = this.props.projects;
        const iconButtonElement = (
            <IconButton
                touch={ true }
                tooltip="дополнительно"
                tooltipPosition="bottom-left"
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
                <MenuItem >устройство 1</MenuItem>
                <MenuItem >устройство 2</MenuItem>
                <MenuItem >устройство 3</MenuItem>
            </IconMenu>
        );

        const rightIconMenu = (
            <IconMenu iconButtonElement={iconButtonElement}>
                <MenuItem leftIcon={<EditIcon  />}>редактировать</MenuItem>
                <MenuItem leftIcon={<PlusIcon  />}>добавить датчик</MenuItem>
                <MenuItem leftIcon={<DeleteIcon  />}>удалить</MenuItem>
            </IconMenu>
        );

        return (
            <div className={ styles['projects-container'] }>
                <div style={{ display: 'flex', flexDirection: 'column', flexBasis: '250px' }}>
                    <h3 className={ styles['projects-project-devices__title'] }>
                        <div style={{ verticalAlign: 'top', display: 'inline-block', height: '48px' }}>Устройства</div>
                        { AddDeviceMenu }
                        <div style={{ clear: 'both' }}></div>
                    </h3>
                    <List className={ styles['projects-project-devices'] }>
                        {[1,2,3,4,5,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1].map((v, i) => <ListItem
                            key={77 + i}
                            className={ styles['projects-project-devices-list-item'] }
                            leftAvatar={<Avatar src="http://files.amperka.ru/img/arduino-robot/figure_ref_top.png" />}
                            rightIcon={ rightIconMenu }
                            secondaryTextLines={2}
                            primaryText={
                                <p>БАВ</p>
                            }
                            secondaryText={
                                <p>
                                    Это устройство нужно для измерения чего-то.
                                </p>
                            }
                        />
                        )}
                    </List>
                </div>
                <div className={ styles['projects-delim'] }></div>

                <div className={ styles['projects-devices-detail'] }>
                    <h3 className={ styles['projects-project-devices__title'] } style={{ position: 'relative' }}>
                        <span>Проект А</span>

                        <div style={{ position: 'absolute', right: '12px', top: 0 }}>
                            <IconButton
                                tooltip="импорт проектов"
                                tooltipPosition="bottom-left"
                                style={{ alignSelf: 'center' }}
                                onTouchTap={ () => { } }>
                                <UploadIcon/>
                            </IconButton>

                            <IconButton
                                tooltip="экспорт проектов"
                                tooltipPosition="bottom-left"
                                style={{ alignSelf: 'center' }}
                                onTouchTap={ () => { } }>
                                <DownloadIcon/>
                            </IconButton>

                            <IconMenu
                                height={ 200 }
                                iconButtonElement={ ProjectsIconButton }
                                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                                targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                            >
                                <MenuItem>проект А</MenuItem>
                                <MenuItem>проект Б</MenuItem>
                            </IconMenu>

                            <IconMenu
                                iconButtonElement={ AddProjectIconButton }
                                anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                                targetOrigin={{ horizontal: 'right', vertical: 'top' }}
                            >
                                <MenuItem leftIcon={<NewProjectIcon/>}>создать проект</MenuItem>
                                <MenuItem leftIcon={<DeleteForeverIcon/>}>удалить текущий проект</MenuItem>
                            </IconMenu>

                        </div>

                    </h3>
                    <div style={{ minWidth: 1000, overflow: 'auto' }}>
                        <div>
                            <Table
                                className={ styles['projects-project-devices__table'] }
                                height={ this.state.tableHeight || "0px" }
                                fixedHeader={ true }
                                selectable={ true }
                                multiSelectable={ false }
                            >
                                <TableHeader
                                    displaySelectAll={false}
                                    adjustForCheckbox={false}
                                    enableSelectAll={false}
                                >
                                    <TableRow style={{ verticalAlign: 'middle' }}>
                                        <TableHeaderColumn colSpan="2"  style={{ paddingRight: 0, width: '110px' }}>
                                            {/*Редактировать/Сохранить*/}
                                        </TableHeaderColumn>
                                        <TableHeaderColumn style={{ width: '120px' }} tooltip="Название датчика" >
                                            Датчик
                                        </TableHeaderColumn>
                                        <TableHeaderColumn style={{ width: '85px' }} tooltip="Тип данных" >
                                            Тип данных
                                        </TableHeaderColumn>
                                        <TableHeaderColumn style={{ width: '50px' }} tooltip="Количество байт" >
                                            Кол-во байт
                                        </TableHeaderColumn>
                                        <TableHeaderColumn style={{ width: '50px' }} tooltip="R - чтение; W - запись; RW - чтение и запись" >
                                            Доступ
                                        </TableHeaderColumn>
                                        <TableHeaderColumn style={{ paddingLeft: '72px' }} colSpan="2" tooltip="Список регистров датчика">
                                            Регистры
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
                                    {[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1].map((v, i) => <TableRow key={1433232+i}>
                                        <TableRowColumn style={{ paddingLeft: 0, paddingRight: '24px', width: '50px' }}>
                                            <IconButton
                                                tooltip="изменить"
                                                tooltipPosition="bottom-right"
                                                onTouchTap={ () => { this.props.deviceSensorEdit(sensor); } }><EditIcon/></IconButton>
                                        </TableRowColumn>
                                        <TableRowColumn style={{ paddingLeft: 0, paddingRight: 0, width: '60px' }}>
                                            <img src="/uploads/0ff41bd8b.png" alt=""/>
                                        </TableRowColumn>
                                        <TableRowColumn style={{ width: '120px' }}>
                                            <strong style={{ fontWeight: 'bold', textTransform: 'uppercase' }} title="амперметр">
                                                амперметр
                                            </strong>
                                        </TableRowColumn>
                                        <TableRowColumn style={{ width: '85px' }}>
                                            unsigned sort
                                        </TableRowColumn>
                                        <TableRowColumn style={{ width: '50px' }}>
                                            4
                                        </TableRowColumn>
                                        <TableRowColumn style={{ width: '50px' }}>
                                            RW
                                        </TableRowColumn>

                                        <TableRowColumn >
                                            <div style={{ display: 'flex' }}>
                                                <IconButton
                                                    tooltip="прочитать"
                                                    tooltipPosition="bottom-left"
                                                    style={{ alignSelf: 'center', flexBasis: '72px' }}
                                                    onTouchTap={ () => { } }>
                                                        <VisibilityIcon/>
                                                </IconButton>
                                                <div style={{ display: 'flex', flexWrap: 'wrap' }}>

                                                    {[1,2,3,2,2,3,4,5].map((v, i) => {
                                                        return <Chip
                                                            backgroundColor={ green500 }
                                                            key={ 753975398 + i }
                                                            style={{ margin: '5px 5px 5px 0' }}
                                                            onRequestDelete={ null }
                                                            onTouchTap={ ()=>{} }
                                                        >
                                                            <span
                                                                style={{ color: '#fff' }}
                                                            >
                                                                0x000{i}
                                                            </span>
                                                            &nbsp;
                                                            {/*<span style={{ color: '#f00' }}>|</span>*/}
                                                            <span style={{ fontSize: '12px', color: '#f00' }}>22.4</span>
                                                        </Chip>
                                                    })}
                                                </div>
                                            </div>
                                        </TableRowColumn>
                                        <TableRowColumn style={{ paddingLeft: 0, paddingRight: 0, width: '70px', textAlign: 'center' }}>
                                            <IconButton
                                                tooltip="удалить"
                                                tooltipPosition="bottom-left"
                                                onTouchTap={ () => {} }>
                                                <DeleteIcon/>
                                            </IconButton>
                                        </TableRowColumn>
                                    </TableRow>)}
                                </TableBody>
                            </Table>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}