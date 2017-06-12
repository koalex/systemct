'use strict';

import styles from './UGO.styl';

import React, { Component }     from 'react';
import PropTypes                from 'prop-types';
import Dropzone from 'react-dropzone'
import Dialog from 'material-ui/Dialog';
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
import { DICTIONARY, UGO, MODAL, _DROP, _CREATE, _UPDATE, _DELETE, _IMPORT, _SUCCESS, _ERROR, _CLEAR, _HIDE } from '../../actions/constants';


@connect(
    state => {
        const { ugo, modal, common } = state;
        return { ugo, modal, common };
    }, { dictionaryCreate, dictionaryRead, dictionaryUpdate, dictionaryDelete, dictionaryExport, dictionaryImport, modalShow, modalHide, inputChange, dispatch }
)
export default class _UGO extends Component {
    constructor(...props) {
        super(...props);
        this.state = {files: []};
    }
    static propTypes = {
        ugo: PropTypes.object,
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
        [UGO + MODAL + _HIDE]: () => {
            this.props.modalHide({ modalType: 'ADD_EDIT_UGO' })
        },
        [DICTIONARY + UGO + _CREATE + _SUCCESS]: ugo => {
            this.props.dispatch({
                type: DICTIONARY + UGO + _CREATE + _SUCCESS,
                payload: ugo
            });
        },
        [DICTIONARY + UGO + _UPDATE + _SUCCESS]: ugo => {
            this.props.dispatch({
                type: DICTIONARY + UGO + _UPDATE + _SUCCESS,
                payload: ugo
            });
        },
        [DICTIONARY + UGO + _DELETE + _SUCCESS]: response => {
            this.props.dispatch({
                type: DICTIONARY + UGO + _DELETE + _SUCCESS,
                payload: response
            });
        },
        [DICTIONARY + UGO + _IMPORT + _SUCCESS]: () => {
            this.props.dictionaryRead('ugo');
        }
    };

    componentDidMount () {
        this.props.dictionaryRead('ugo');
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
        let title           = this.refs.ugoTitle.input.value;
        let ugoDescription  = this.refs.ugoDescription.input.refs.input.value;
        let files           = this.props.ugo.ugo.files;
        let data = {
            dictionary: 'ugo',
            body: {
                title,
                description: ugoDescription,
            },
            skipSuccess: true
        };

        if (files && files.length) data.body.files = files;

        if (this.props.ugo.ugo._id) {
            data.ugoId = this.props.ugo.ugo._id;
            this.props.dictionaryUpdate(data);
        } else {
            this.props.dictionaryCreate(data);
        }
    };

    handleDrop = data => {
        this.props.dispatch({
            type: DICTIONARY + UGO +_DROP,
            data
        });
    };

    dictionaryImport = data => {
        this.props.dictionaryImport({
            dictionary: 'ugo',
            skipSuccess: true,
            body: {
                files: data
            }
        });
    };

    inputChange = (data) => {
        let needToClearErrors = this.props.ugo.error || Object.keys(this.props.ugo.errors).length;

        if (needToClearErrors) this.props.dispatch({ type: _ERROR + _CLEAR });

        this.props.inputChange(data)
    };

    render () {
        const reducer      = this.props.ugo;
        const { dialog }   = reducer;
        let { preview }    = reducer.ugo.files[0] ? reducer.ugo.files[0] : '';

        const items = reducer.items.map(ugo => {
            return <Paper key={ Math.random() } className={ styles['ugo-paper'] }>
                <div className={ styles['ugo-img-container'] }>
                    <img className={ styles['ugo-img'] } src={ugo.img} alt=""/>
                </div>
                <p  className={ styles['ugo-paper-title'] }>{ ugo.title }</p>
                <hr/>
                <FlatButton label="РЕДАКТИРОВАТЬ" primary={ true } disabled={ reducer.isLoading } onTouchTap={ () => { this.props.modalShow({ modalType: 'ADD_EDIT_UGO', ugo }) } } />
                <FlatButton label="УДАЛИТЬ" secondary={ true } disabled={ reducer.isLoading } onTouchTap={ () => { this.props.dictionaryDelete({ dictionary: 'ugo', ugoId: ugo._id, skipSuccess: true }) } } />
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
                onTouchTap={ () => { this.props.modalHide({ modalType: 'ADD_EDIT_UGO' }) } }
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
                   open={ Boolean(this.props.ugo.error) }
                   message={ this.props.ugo.error || '' }
                   autoHideDuration={ 2000 }
               />
               { items }
               <FloatingActionButton
                   disabled={ reducer.isLoading }
                   onTouchTap={ () => { this.props.modalShow({ modalType: 'ADD_EDIT_UGO' }) } }  className={ styles['ugo-add-btn'] }>
                   <PlusIcon />
               </FloatingActionButton>
               <FloatingActionButton
                   disabled={ reducer.isLoading }
                   onTouchTap={ () => { dictionaryDropzoneRef.open() } }  className={ styles['ugo-upload-btn'] }>
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
                   onTouchTap={ () => { this.props.dictionaryExport('ugo', 'dictionary_ugo.tar'); } }  className={ styles['ugo-download-btn'] }>
                   <DownloadIcon />
               </FloatingActionButton>
               <Dialog
                   title={ reducer.ugo._id ? reducer.ugo.title : 'Добавить УГО' }
                   actions={ actions }
                   modal={ true }
                   autoScrollBodyContent={ true }
                   open={ dialog.isOpen }
               >
                   <div className={ styles['ugo-add-content'] }>
                       <div style={ { textAlign: 'center' } }>
                           <Dropzone
                               disabled={ reducer.isLoading }
                               className={ styles['ugo-dropzone'] }
                               multiple={ false }
                               ref={ node => { dropzoneRef = node; } }
                               accept="image/jpeg,image/jpg,image/png,image/tiff,image/gif"
                               onDrop={ this.handleDrop }>
                               {/*window.URL.revokeObjectURL(file.preview)*/}
                               { preview ? <img src={ preview } className={ styles['ugo-dropzone-preview'] } alt=""/> : <ImageIcon className={ styles['ugo-dropzone-cover'] } />}

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
                               defaultValue={ reducer.ugo.title }
                               onBlur={ () => { this.inputChange({ componentName: 'addEditUGO', title: this.refs.ugoTitle.input.value }); } }
                               name="title"
                               ref="ugoTitle"
                               disabled={ reducer.isLoading }
                               floatingLabelText="Название"
                               errorText={ reducer.errors.title }
                           />
                           <br/>
                           <TextField
                               style={ { textAlign: 'left' } }
                               rows={ 3 }
                               rowsMax={ 5 }
                               multiLine={ true }
                               defaultValue={ reducer.ugo.description }
                               onBlur={ () => { this.inputChange({ componentName: 'addEditUGO', description: this.refs.ugoDescription.input.refs.input.value }); } }
                               name="description"
                               ref="ugoDescription"
                               disabled={ reducer.isLoading }
                               floatingLabelText="Дополнительная&nbsp;информация"
                               errorText={ '' }
                           />
                       </div>
                   </div>
               </Dialog>
           </div>
        );
    }
}