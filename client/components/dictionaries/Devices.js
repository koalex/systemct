'use strict';

import styles from './Devices.styl';

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
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

import EditIcon                from 'material-ui/svg-icons/editor/mode-edit';
import CheckIcon                from 'material-ui/svg-icons/navigation/check';
import DeleteIcon                from 'material-ui/svg-icons/action/delete';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import SensorIcon           from 'material-ui/svg-icons/hardware/memory';
import DevicesIcon          from 'material-ui/svg-icons/device/devices';
import { blue300, indigo900 } from 'material-ui/styles/colors';

import Dropzone from 'react-dropzone'
import Dialog from 'material-ui/Dialog';
import TextField                from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Snackbar                 from 'material-ui/Snackbar';
import FloatingActionButton     from 'material-ui/FloatingActionButton';
import PlusIcon                 from 'material-ui/svg-icons/content/add';
import ImageIcon                 from 'material-ui/svg-icons/image/image';
import Paper from 'material-ui/Paper';
import CircularProgress                                     from 'material-ui/CircularProgress';

import { connect }              from 'react-redux';
import { deviceSensorEdit, addDeviceSensor, setCurrentDevice, dictionaryCreate, dictionaryRead, dictionaryUpdate, dictionaryDelete, dictionaryExport, dictionaryImport, modalShow, modalHide, inputChange, dispatch } from '../../actions';
import { DICTIONARY, UGO, SENSOR, DEVICE, MODAL, _DROP, _CREATE, _UPDATE, _DELETE, _IMPORT, _SUCCESS, _ERROR, _CLEAR, _HIDE } from '../../actions/constants';


@connect(
    state => {
        const { ugo, sensors, devices, modal, common } = state;
        return { ugo, sensors, devices, modal, common };
    }, { deviceSensorEdit, addDeviceSensor, setCurrentDevice, dictionaryCreate, dictionaryRead, dictionaryUpdate, dictionaryDelete, dictionaryExport, dictionaryImport, modalShow, modalHide, inputChange, dispatch }
)
export default class _Device extends Component {
    constructor(...props) {
        super(...props);
        this.state = { files: [] };
    }
    static propTypes = {
        ugo: PropTypes.object,
        sensors: PropTypes.object,
        devices: PropTypes.object,

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
            this.props.modalHide({ modalType: 'ADD_EDIT_DEVICE' })
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

    submit = () => {
        let title           = this.refs.deviceTitle.input.value;
        let files           = this.props.devices.device.files;
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
            this.props.dictionaryUpdate(data);
        } else {
            this.props.dictionaryCreate(data);
        }
    };

    render () {
        const reducer = this.props.devices;
        const sensors = this.props.sensors.items.map(sensor => {
            return (<MenuItem onTouchTap={ () => { this.addSensor(sensor); } } key={ sensor._id } style={{ display: 'flex', alignItems: 'center' }}>
                <Chip>
                    <Avatar src={ sensor.img } />
                    { sensor.title }
                </Chip>
            </MenuItem>)
        });
        const actions = [
            <FlatButton
                label="Сохранить"
                primary={ true }
                keyboardFocused={ false }
                onTouchTap={ this.submit }
                disabled={ reducer.isLoading }
            />,
            <FlatButton
                label="Отмена"
                primary={ true }
                keyboardFocused={ false }
                onTouchTap={ () => { this.props.modalHide({ modalType: 'ADD_DEVICE' }) } }
                disabled={ reducer.isLoading }
            />

        ];
        const chipStyle = { margin: '5px' };
        const editMode = false;

        let dropzoneRef;
        let dictionaryDropzoneRef;
        let { preview } = reducer.device.files[0] ? reducer.device.files[0] : '';

        const rows = reducer.device && Array.isArray(reducer.device.sensors) ? reducer.device.sensors.map((sensor, i) => {
            return (<TableRow key={ sensor._id || i }>
                <TableRowColumn style={{ width: '50px' }}>
                    <IconButton onTouchTap={ () => { this.props.deviceSensorEdit(sensor); } }>
                        { !sensor.editMode ? <EditIcon/> : <CheckIcon></CheckIcon> }
                    </IconButton>
                </TableRowColumn>
                <TableRowColumn style={{ width: '240px' }}>
                    <Chip
                        onTouchTap={ ()=>{} }
                    >
                        <Avatar src={ sensor.img || '/uploads/0ff41bd8b.png' } />
                        { sensor.title }
                    </Chip>
                </TableRowColumn>
                {/*<TableRowColumn>Действующее значение сигнала канала</TableRowColumn>*/}
                <TableRowColumn style={{ width: '80px' }}>
                    { sensor.editMode ? <SelectField
                        onChange={ () => { this.inputChange({ componentName: 'editDeviceSensor', _id: sensor._id, sensorDataType: this.refs[sensor._id + 'sensorDataType'].input.value }); } }
                        name="sensorDataType"
                        ref={ sensor._id + 'sensorDataType' }
                        style={{ width: '150px' }}
                        defaultValue={ sensor.dataType }
                    >
                        <MenuItem value={ '--' } primaryText="" />
                        <MenuItem value={ 'float' } primaryText="float" />
                        <MenuItem value={ 'double' } primaryText="double" />
                        <MenuItem value={ 'unsigned short' } primaryText="unsigned short" />
                    </SelectField> : 'float' }
                </TableRowColumn>
                <TableRowColumn style={{ width: '80px' }}>
                    { sensor.editMode ? <SelectField
                        style={{ width: '80px' }}
                        disabled={ !sensor.editMode }
                        name="sensorBytes"
                        ref={ sensor._id + 'sensorBytes' }
                        defaultValue={ sensor.bytes }
                        onChange={ () => { this.inputChange({ componentName: 'editDeviceSensor', _id: sensor._id, sensorBytes: this.refs[sensor._id + 'sensorBytes'].input.value }); } }
                    >
                        <MenuItem value={ 0 } primaryText={ null } />
                        <MenuItem value={ 1 } primaryText="1" />
                        <MenuItem value={ 2 } primaryText="2" />
                        <MenuItem value={ 3 } primaryText="3" />
                        <MenuItem value={ 4 } primaryText="4" />
                        <MenuItem value={ 5 } primaryText="5" />
                        <MenuItem value={ 6 } primaryText="6" />
                        <MenuItem value={ 7 } primaryText="7" />
                        <MenuItem value={ 8 } primaryText="8" />
                        <MenuItem value={ 9 } primaryText="9" />
                        <MenuItem value={ 10 } primaryText="10" />
                        <MenuItem value={ 11 } primaryText="11" />
                        <MenuItem value={ 12 } primaryText="12" />
                        <MenuItem value={ 13 } primaryText="13" />
                        <MenuItem value={ 14 } primaryText="14" />
                        <MenuItem value={ 15 } primaryText="15" />
                        <MenuItem value={ 16 } primaryText="16" />
                    </SelectField> : 4 }

                </TableRowColumn>
                <TableRowColumn style={{ width: '80px' }}>
                    { sensor.editMode ? <SelectField
                        style={{ width: '80px' }}
                        value={ 'R' }
                        onChange={()=>{}}
                    >
                        <MenuItem value={ null } primaryText={ null } />
                        <MenuItem value={ 'R' } primaryText="R" />
                        <MenuItem value={ 'RW' } primaryText="RW" />
                        <MenuItem value={ 'W' } primaryText="W" />
                    </SelectField> : 'R' }
                </TableRowColumn>
                <TableRowColumn>
                    { sensor.editMode ? <FloatingActionButton mini={ true } style={{ display: 'inline-block', float: 'left', margin: '5px' }}
                        onTouchTap={ () => { } } >
                        <PlusIcon />
                    </FloatingActionButton> : null  }
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', height: 'auto' }}>
                        { sensor.registers ? sensor.registers.map(register => <Chip
                            style={ chipStyle }
                            onRequestDelete={ sensor.editMode ? () => {} : null }
                            onTouchTap={ ()=>{} }
                        >{ register }</Chip>) : null }
                    </div>
                </TableRowColumn>
                <TableRowColumn style={{ width: '50px'}}>
                    <IconButton onTouchTap={ () => { console.log('DELETE DEVICE SENSOR'); } }>
                        <DeleteIcon></DeleteIcon>
                    </IconButton>
                </TableRowColumn>
            </TableRow>)
        }) : null;
        return (
            <div className={ styles['devices-table-wrapper'] } >
                { reducer.isLoading ? <div>
                    <CircularProgress
                        style={{ position: 'fixed', top: 'calc(50% - 100px)', left: 'calc(50% - 100px)' }}
                        size={ 200 } thickness={ 5 }>
                    </CircularProgress>
                    <p style={{ position: 'fixed', top: 'calc(50% - 100px)', left: 'calc(50% - 100px)', width: '200px', height: '200px', lineHeight: '200px', fontFamily: 'sans-serif', fontSize: '18px', 'textAlign': 'center', whiteSpace: 'nowrap' }}>
                        загружаю устройства
                    </p>
                </div> : null }
                { reducer.device._id ? <Table selectable={ false } fixedHeader={ true } style={{ maxHeight: '100%' }}>
                    <TableHeader
                        displaySelectAll={ false }
                        adjustForCheckbox={ false }
                        enableSelectAll={ false }
                    >
                        <TableRow style={{ verticalAlign: 'middle' }}>
                            <TableHeaderColumn style={{ width: '50px'}}>

                            </TableHeaderColumn>
                            <TableHeaderColumn style={{ width: '240px' }}>Датчик</TableHeaderColumn>
                            {/*<TableHeaderColumn>Описание</TableHeaderColumn>*/}
                            <TableHeaderColumn style={{ width: '80px' }}>Тип данных</TableHeaderColumn>
                            <TableHeaderColumn style={{ width: '80px' }}>Кол-во байт</TableHeaderColumn>
                            <TableHeaderColumn style={{ width: '80px' }}>Доступ</TableHeaderColumn>
                            <TableHeaderColumn>Регистры</TableHeaderColumn>
                            <TableHeaderColumn style={{ width: '50px'}}>

                            </TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={ false } style={{ verticalAlign: 'middle' }}>
                        {rows}
                    </TableBody>
                </Table> : <p className={ styles['no-devices'] }>ВЫБЕРИТЕ ИЛИ СОЗДАЙТЕ УСТРОЙСТВО</p> }


                <IconMenu
                    className={ styles['devices-select-btn'] }
                    iconButtonElement={<FloatingActionButton><MoreVertIcon/><DevicesIcon/></FloatingActionButton>}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    targetOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    maxHeight={ 272 }
                >
                    {reducer.items.length ? reducer.items.map(item => <MenuItem onTouchTap={ () => { this.props.setCurrentDevice(item._id); } }>{ item.title }</MenuItem>)  : <MenuItem>
                        устройства отсутствуют
                    </MenuItem> }
                </IconMenu>
                <FloatingActionButton
                    disabled={ false }
                    onTouchTap={ () => { this.props.modalShow({ modalType: 'ADD_DEVICE' }) } }  className={ styles['devices-add-btn'] }>
                    <PlusIcon />
                    <DevicesIcon/>
                </FloatingActionButton>
                <IconMenu
                    className={ styles['sensors-add-btn'] }
                    iconButtonElement={<FloatingActionButton><PlusIcon /><SensorIcon/></FloatingActionButton>}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    targetOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    maxHeight={ 272 }
                >
                    { reducer.device._id ? sensors : <MenuItem>не выбрано устройство</MenuItem> }
                </IconMenu>
                <FloatingActionButton
                    disabled={ false }
                    onTouchTap={ () => {} }  className={ styles['devices-upload-btn'] }>

                    <UploadIcon />
                </FloatingActionButton>
                <FloatingActionButton
                    disabled={ false }
                    onTouchTap={ () => {} }  className={ styles['devices-download-btn'] }>
                    <DownloadIcon />
                </FloatingActionButton>

                <Dialog
                    title={ 'Добавить устройство' }
                    actions={ actions }
                    modal={ true }
                    autoScrollBodyContent={ true }
                    open={ reducer.dialog.isOpen }
                >
                    <div className={ styles['device-add-content'] }>
                        <div style={ { textAlign: 'center' } }>
                            <Dropzone
                                disabled={ reducer.isLoading }
                                className={ styles['device-dropzone'] }
                                multiple={ false }
                                ref={ node => { dropzoneRef = node; } }
                                accept="image/jpeg,image/jpg,image/png,image/tiff,image/gif"
                                onDrop={ this.handleDrop }>
                                {/*window.URL.revokeObjectURL(file.preview)*/}
                                { preview ? <img src={ preview } className={ styles['device-dropzone-preview'] } alt=""/> : <ImageIcon className={ styles['device-dropzone-cover'] } />}

                            </Dropzone>
                            <br/>
                            <FlatButton
                                label="Выбрать картинку"
                                primary={ true }
                                keyboardFocused={ true }
                                onTouchTap={ () => { dropzoneRef.open(); } }
                                disabled={ reducer.isLoading }
                            />
                        </div>
                        <div style={ { margin: '0 20px', flexGrow: 1, textAlign: 'center' } }>
                            <TextField
                                style={ { textAlign: 'left' } }
                                defaultValue={ reducer.device.title }
                                onBlur={ () => { this.inputChange({ componentName: 'addDevice', title: this.refs.deviceTitle.input.value }); } }
                                name="title"
                                ref="deviceTitle"
                                disabled={ reducer.isLoading }
                                floatingLabelText="Название"
                                errorText={ reducer.errors.title }
                            />
                        </div>
                    </div>
                </Dialog>

                { reducer.device._id ? <Chip
                    backgroundColor={ blue300 }
                    onTouchTap={() => {} }
                    className={ styles['current-device'] }
                >
                    <Avatar src={ reducer.device.img || null } size={ 32 } color={blue300} backgroundColor={ indigo900 }>
                        { reducer.device.img ? null : 'У' }
                    </Avatar>
                    { reducer.device.title }
                </Chip> : null }

                <Snackbar
                    style={{ 'textAlign': 'center' }}
                    open={ Boolean(this.props.devices.error) }
                    message={ this.props.devices.error || '' }
                    autoHideDuration={ 2000 }
                />
            </div>
        );
    }
}