'use strict';

import styles from './Sensors.styl';

import React, { Component }     from 'react';
import PropTypes                from 'prop-types';
import Dropzone from 'react-dropzone'
import Dialog from 'material-ui/Dialog';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField                from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Snackbar                 from 'material-ui/Snackbar';
import FloatingActionButton     from 'material-ui/FloatingActionButton';
import PlusIcon                 from 'material-ui/svg-icons/content/add';
import ImageIcon                 from 'material-ui/svg-icons/image/image';
import UploadIcon                from 'material-ui/svg-icons/file/file-upload';
import DownloadIcon                from 'material-ui/svg-icons/file/file-download';
import Paper from 'material-ui/Paper';
import CircularProgress                                     from 'material-ui/CircularProgress';

import { connect }              from 'react-redux';
import { dictionaryCreate, dictionaryRead, dictionaryUpdate, dictionaryDelete, dictionaryExport, dictionaryImport, modalShow, modalHide, inputChange, dispatch } from '../../actions';
import { DICTIONARY, UGO, SENSOR, MODAL, _DROP, _CREATE, _UPDATE, _DELETE, _IMPORT, _SUCCESS, _ERROR, _CLEAR, _HIDE } from '../../actions/constants';


@connect(
    state => {
        const { ugo, sensors, modal, common } = state;
        return { ugo, sensors, modal, common };
    }, { dictionaryCreate, dictionaryRead, dictionaryUpdate, dictionaryDelete, dictionaryExport, dictionaryImport, modalShow, modalHide, inputChange, dispatch }
)
export default class _Sensor extends Component {
    constructor(...props) {
        super(...props);
        this.state = {files: []};
    }
    static propTypes = {
        ugo: PropTypes.object,
        sensors: PropTypes.object,
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
        [SENSOR + MODAL + _HIDE]: () => {
            this.props.modalHide({ modalType: 'ADD_EDIT_SENSOR' })
        },
        [DICTIONARY + SENSOR + _CREATE + _SUCCESS]: sensor => {
            this.props.dispatch({
                type: DICTIONARY + SENSOR + _CREATE + _SUCCESS,
                payload: sensor
            });
        },
        [DICTIONARY + SENSOR + _UPDATE + _SUCCESS]: sensor => {
            this.props.dispatch({
                type: DICTIONARY + SENSOR + _UPDATE + _SUCCESS,
                payload: sensor
            });
        },
        [DICTIONARY + SENSOR + _DELETE + _SUCCESS]: response => {
            this.props.dispatch({
                type: DICTIONARY + SENSOR + _DELETE + _SUCCESS,
                payload: response
            });
        },
        [DICTIONARY + SENSOR + _IMPORT + _SUCCESS]: () => {
            this.props.dictionaryRead('sensor');
        }
    };

    componentDidMount () {
        this.props.dictionaryRead('sensor');
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

    submit = () => {
        let title               = this.refs.sensorTitle.input.value;
        let sensorDesignation   = this.refs.sensorDesignation.input.refs.input.value;
        let sensorType          = this.props.sensors.sensor.type;
        let files               = this.props.sensors.sensor.files;
        let data = {
            dictionary: 'sensor',
            body: {
                title,
                type: sensorType,
                designation: sensorDesignation,
            },
            skipSuccess: true
        };

        if (files && files.length) data.body.files = files;

        if (this.props.sensors.sensor._id) {
            data.sensorId = this.props.sensors.sensor._id;
            this.props.dictionaryUpdate(data);
        } else {
            this.props.dictionaryCreate(data);
        }
    };

    handleDrop = data => {
        this.props.dispatch({
            type: DICTIONARY + SENSOR +_DROP,
            data
        });
    };

    dictionaryImport = data => {
        this.props.dictionaryImport({
            dictionary: 'sensor',
            skipSuccess: true,
            body: {
                files: data
            }
        });
    };

    inputChange = (data) => {
        let needToClearErrors = this.props.sensors.error || Object.keys(this.props.sensors.errors).length;

        if (needToClearErrors) this.props.dispatch({ type: _ERROR + _CLEAR });

        this.props.inputChange(data)
    };

    render () {
        const reducer      = this.props.sensors;
        const { dialog }   = reducer;
        let { preview }    = reducer.sensor.files[0] ? reducer.sensor.files[0] : '';

        const items = reducer.items.map(sensor => {
            return <Paper key={ Math.random() } className={ styles['sensor-paper'] }>
                <div className={ styles['sensor-img-container'] }>
                    <img className={ styles['sensor-img'] } src={sensor.img} alt=""/>
                </div>
                <p  className={ styles['sensor-paper-title'] }>{ sensor.title }</p>
                <hr/>
                <FlatButton label="РЕДАКТИРОВАТЬ" primary={ true } disabled={ reducer.isLoading } onTouchTap={ () => { this.props.modalShow({ modalType: 'ADD_EDIT_SENSOR', sensor }) } } />
                <FlatButton label="УДАЛИТЬ" secondary={ true } disabled={ reducer.isLoading } onTouchTap={ () => { this.props.dictionaryDelete({ dictionary: 'sensor', sensorId: sensor._id, skipSuccess: true }) } } />
            </Paper>
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
                onTouchTap={ () => { this.props.modalHide({ modalType: 'ADD_EDIT_SENSOR' }) } }
                disabled={ reducer.isLoading }
            />

        ];

        let dropzoneRef;
        let dictionaryDropzoneRef;

        return (
            <div>
                { reducer.isLoading ? <div>
                    <CircularProgress
                        style={{ position: 'fixed', top: 'calc(50% - 100px)', left: 'calc(50% - 100px)' }}
                        size={ 200 } thickness={ 5 }>
                    </CircularProgress>
                    <p style={{ position: 'fixed', top: 'calc(50% - 100px)', left: 'calc(50% - 100px)', width: '200px', height: '200px', lineHeight: '200px', fontFamily: 'sans-serif', fontSize: '18px', 'textAlign': 'center', whiteSpace: 'nowrap' }}>
                        загружаю справочник
                    </p>
                </div> : null }

                <Snackbar
                    style={{ 'textAlign': 'center' }}
                    open={ Boolean(reducer.error) }
                    message={ reducer.error || '' }
                    autoHideDuration={ 2000 }
                />
                { items }
                <FloatingActionButton
                    disabled={ reducer.isLoading }
                    onTouchTap={ () => { this.props.modalShow({ modalType: 'ADD_EDIT_SENSOR' }) } }  className={ styles['sensor-add-btn'] }>
                    <PlusIcon />
                </FloatingActionButton>
                <FloatingActionButton
                    disabled={ reducer.isLoading }
                    onTouchTap={ () => { dictionaryDropzoneRef.open() } }  className={ styles['sensor-upload-btn'] }>
                    <Dropzone
                        style={{ display: 'none' }}
                        disabled={ reducer.isLoading }
                        multiple={ false }
                        ref={ node => { dictionaryDropzoneRef = node; } }
                        accept=".tar"
                        onDrop={ this.dictionaryImport }>

                    </Dropzone>
                    <UploadIcon />
                </FloatingActionButton>
                <FloatingActionButton
                    disabled={ reducer.isLoading }
                    onTouchTap={ () => { this.props.dictionaryExport('sensor', 'dictionary_sensors.tar'); } }  className={ styles['sensor-download-btn'] }>
                    <DownloadIcon />
                </FloatingActionButton>
                <Dialog
                    title={ reducer.sensor._id ? reducer.sensor.title : 'Добавить датчик' }
                    actions={ actions }
                    modal={ true }
                    autoScrollBodyContent={ true }
                    open={ dialog.isOpen }
                >
                    <div className={ styles['sensor-add-content'] }>
                        <div style={ { textAlign: 'center' } }>
                            <Dropzone
                                disabled={ reducer.isLoading }
                                className={ styles['sensor-dropzone'] }
                                multiple={ false }
                                ref={ node => { dropzoneRef = node; } }
                                accept="image/jpeg,image/jpg,image/png,image/tiff,image/gif"
                                onDrop={ this.handleDrop }>
                                {/*window.URL.revokeObjectURL(file.preview)*/}
                                { preview ? <img src={ preview } className={ styles['sensor-dropzone-preview'] } alt=""/> : <ImageIcon className={ styles['sensor-dropzone-cover'] } />}

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
                                defaultValue={ reducer.sensor.title }
                                onBlur={ () => { this.inputChange({ componentName: 'addEditSensor', title: this.refs.sensorTitle.input.value }); } }
                                name="title"
                                ref="sensorTitle"
                                disabled={ reducer.isLoading }
                                floatingLabelText="Название"
                                errorText={ reducer.errors.title }
                            />
                            <br/>
                            <SelectField
                                style={ { textAlign: 'left' } }
                                value={ reducer.sensor.type }
                                onChange={ (event, index, value) => {
                                    this.inputChange({ componentName: 'addEditSensor', type: value });
                                } }
                                name="type"
                                ref="sensorType"
                                disabled={ reducer.isLoading }
                                floatingLabelText="Тип Датчика"
                                errorText={ reducer.errors.type }
                                >
                                <MenuItem value={ 'числовой' } primaryText="числовой" />
                                <MenuItem value={ 'дискретный' } primaryText="дискретный" />
                            </SelectField>
                            <br/>
                            <TextField
                                style={ { textAlign: 'left' } }
                                rows={ 3 }
                                rowsMax={ 4 }
                                multiLine={ true }
                                defaultValue={ reducer.sensor.designation }
                                onBlur={ () => { this.inputChange({ componentName: 'addEditSensor', designation: this.refs.sensorDesignation.input.refs.input.value }); } }
                                name="designation"
                                ref="sensorDesignation"
                                disabled={ reducer.isLoading }
                                floatingLabelText="Обозначение&nbsp;устройства"
                                errorText={ '' }
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        );
    }
}