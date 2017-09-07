/*** ✰✰✰ Konstantin Aleksandrov ✰✰✰ https://github.com/koalex ✰✰✰ ***/
 /* 
   ================================
   ===       MODULE NAME       ====
   ================================ 
*/

'use strict';

import styles                                                            from './index.styl';
import React, { Component }                                              from 'react';
import PropTypes                                                         from 'prop-types';
import * as AT                                                           from '../../actions/constants';
import moment from 'moment';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker                                                        from 'material-ui/DatePicker';
import TimePicker                                                        from 'material-ui/TimePicker';
import IconMenu                 from 'material-ui/IconMenu';
import MenuItem                 from 'material-ui/MenuItem';
import RaisedButton             from 'material-ui/RaisedButton';
import IconButton                                                        from 'material-ui/IconButton';
import FloatingActionButton                                              from 'material-ui/FloatingActionButton';
import { RadioButton, RadioButtonGroup }                                 from 'material-ui/RadioButton';
import RefreshIndicator                                                  from 'material-ui/RefreshIndicator';
import Avatar from 'material-ui/Avatar';
import MoreVertIcon                                                      from 'material-ui/svg-icons/navigation/more-vert';
import TimelineIcon                                                      from 'material-ui/svg-icons/action/timeline';
import SettingstIcon                                                     from 'material-ui/svg-icons/action/settings';
import SensorIcon                                                        from 'material-ui/svg-icons/hardware/memory';
import RefreshIcon                                                       from 'material-ui/svg-icons/navigation/refresh';
import RemoveIcon                                                        from 'material-ui/svg-icons/action/delete';
import { cyan500, red500, purple500, blue500, green500, amber500, brown500, grey500, blueGrey500} from 'material-ui/styles/colors';
import intl                                                              from 'intl';
import 'intl/locale-data/jsonp/ru-RU.js';


class LineDot extends Component {
    render () {
        const {cx, cy, stroke, payload, value} = this.props;

        if (payload.emergency) {
            let size = 14;
            let strokeSize = 1;
            return (
                <svg className={ payload.blink ? styles.blink : null } width={size} height={size} x={cx - (size/2)} y={cy - (size/2)}>
                    <circle r={(size - strokeSize * 2) / 2} cx={size/2} cy={size/2} fill={payload.color} stroke={payload.color} strokeWidth={strokeSize} />
                </svg>
            )
        }

        return null;
    }
}

class ChartTooltip extends Component {
    render() {
        let {payload, label} = this.props;
        if (!Array.isArray(payload)) payload = [];
        return (
            <div style={{ backgroundColor: cyan500 }} className={styles['chart-tooltip']}>
                <p className={styles['chart-tooltip__label']}>ВРЕМЯ: {label}</p>
                <hr/>
                {payload.map(pld => {
                    return <p key={pld.dataKey} className={styles['chart-tooltip__payload']}>{pld.name}: {pld.value}</p>
                })}
            </div>
        );
        return null;
    }
}

export default class SensorChart extends Component {
    constructor(...props) {
        super(...props);
        this.state = {
            sensors: [],
            realtimeData: [],
            needRefresh: false,
            chartSettings: {
                // realtime: false,
                selectedSensors: [],
                // dateStart: new Date(),
                // dateEnd: new Date(),
                // timeStart: new Date((new Date()).setHours(0, 0, 0)),
                // timeEnd: new Date((new Date()).setHours(23, 59, 59)),
                // dataSource: 'changelog'
            },
            error: false
        }
    }

    static propTypes = {
        _id: PropTypes.string.isRequired,
        syncId: PropTypes.string,
        pId: PropTypes.string.isRequired,
        dId: PropTypes.string.isRequired,
        data: PropTypes.array,
        socket: PropTypes.object,
        sensors: PropTypes.array,
        submit: PropTypes.func.isRequired,
        remove: PropTypes.func.isRequired,
        width: PropTypes.number,
        height: PropTypes.number,
        loading: PropTypes.bool,
        error: PropTypes.bool,
        dateStart: PropTypes.object,
        dateEnd: PropTypes.object,
        timeStart: PropTypes.object,
        timeEnd: PropTypes.object,
        dataSource: PropTypes.string,
        realtime: PropTypes.bool,
        // disabled: PropTypes.bool
    };
    timer = 100;
    socketListensers = {
        [AT.CHANGELOG + AT.DATA + AT._READ + AT._SUCCESS]: data => {
            if (!data.dt) {
                data.dt = new Date()
            }

            this.setState(Object.assign({}, this.state, {
                realtimeData: this.state.realtimeData.concat([data])
            }));
        },
        [AT.LOG + AT.DATA + AT._READ + AT._SUCCESS]: data => {
            console.log(this.props._id + ' - ', data)
            if (!data.dt) {
                data.dt = new Date()
            }

            this.setState(Object.assign({}, this.state, {
                realtimeData: this.state.realtimeData.concat([data])
            }));
        }
    };

    // realtime = enable => {
    //     let ev = this.state.chartSettings.dataSource == 'changelog' ? AT.CHANGELOG + AT._JOIN : AT.LOG + AT._JOIN;
    //     if (enable) {
    //         this.props.socket.emit(ev, {
    //             projectId: this.props.pId,
    //             deviceId: this.props.dId,
    //             sensorsId: this.state.chartSettings.selectedSensors
    //         });
    //
    //         for (let ev in this.socketListensers) {
    //             this.props.socket.on(ev, this.socketListensers[ev]);
    //         }
    //
    //         let nextState = Object.assign({}, this.state, {
    //             realtimeData: []
    //         });
    //
    //         nextState.chartSettings.realtime = true;
    //         this.setState(nextState);
    //
    //     } else {
    //         this.props.socket.emit(ev, {
    //             projectId: this.props.pId,
    //             deviceId: this.props.dId,
    //             sensorsId: this.state.chartSettings.selectedSensors
    //         });
    //         for (let ev in this.socketListensers) {
    //             this.props.socket.removeListener(ev, this.socketListensers[ev]);
    //         }
    //         let nextState = Object.assign({}, this.state, {
    //             realtimeData: []
    //         });
    //
    //         nextState.chartSettings.realtime = false;
    //         this.setState(nextState);
    //     }
    // };

    componentDidMount () {
        /*for (let ev in this.socketListensers) {
            this.props.socket.on(ev, this.socketListensers[ev]);
        }*/
        let resizeTimer;
        /*let chartWidth   = (parseInt(window.getComputedStyle(document.querySelector('.charts-container')).width)) - 2;
        if (chartWidth > 1000) {
            chartWidth = (chartWidth / 2) - 2;
        }*/
        let chartWidth  = this.props.width - 2;
        let chartHeight = this.props.height - 6;


        // let chartHeight  = (parseInt(window.getComputedStyle(document.querySelector('.charts-container')).height) / 2) - 6;
        this.setState(Object.assign({}, this.state, { chartWidth, chartHeight }));

        let self = this;
        /*window.addEventListener('resize', ev => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {

                // let chartWidth   = (parseInt(window.getComputedStyle(document.querySelector('.charts-container')).width)) - 2;
                // if (chartWidth > 1000) {
                //     chartWidth = (chartWidth / 2) - 2;
                // }
                // let chartHeight = (parseInt(window.getComputedStyle(document.querySelector('.charts-container')).height) / 2) - 6;
                let chartWidth  = self.props.width - 2;
                let chartHeight = self.props.height - 6;
                console.log('1 =', chartWidth)
                self.setState(Object.assign({}, self.state, { chartWidth, chartHeight }));

            }, 150);
        });*/
    }

    componentWillUnmount () {
        for (let ev in this.socketListensers) {
            this.props.socket.removeListener(ev, this.socketListensers[ev]);
        }

    }

    /*componentDidUpdate(prevProps, prevState) {}*/
    componentWillReceiveProps (nextProps) {
        let chartWidth  = nextProps.width - 2;
        let chartHeight = nextProps.height - 6;

        let refresh = false;

        if (moment(nextProps.dateStart).format('DD.MM / HH:mm:ss') != moment(this.props.dateStart).format('DD.MM / HH:mm:ss') || moment(nextProps.dateEnd).format('DD.MM / HH:mm:ss') != moment(this.props.dateEnd).format('DD.MM / HH:mm:ss') || moment(nextProps.timeStart).format('HH:mm:ss') != moment(this.props.timeStart).format('HH:mm:ss') || moment(nextProps.timeEnd).format('HH:mm:ss') != moment(this.props.timeEnd).format('HH:mm:ss')) {
            refresh = true
        }

        this.setState(Object.assign({}, this.state, { chartWidth, chartHeight, needRefresh: refresh }));


        // let ev = this.state.chartSettings.dataSource == 'changelog' ? AT.CHANGELOG + AT._JOIN : AT.LOG + AT._JOIN;
        let ev = this.props.dataSource == 'changelog' ? AT.CHANGELOG + AT._JOIN : AT.LOG + AT._JOIN;

        if (nextProps.realtime && this.props.realtime == false) {
            this.props.socket.emit(ev, {
                projectId: this.props.pId,
                deviceId: this.props.dId,
                sensorsId: this.state.chartSettings.selectedSensors
            });

            for (let ev in this.socketListensers) {
                this.props.socket.on(ev, this.socketListensers[ev]);
            }

            let nextState = Object.assign({}, this.state, {
                realtimeData: []
            });

            // nextState.chartSettings.realtime = true;
            this.setState(nextState);

        } else if (nextProps.realtime == false && this.props.realtime == true) {
            this.props.socket.emit(ev, {
                projectId: this.props.pId,
                deviceId: this.props.dId,
                sensorsId: this.state.chartSettings.selectedSensors
            });
            for (let ev in this.socketListensers) {
                this.props.socket.removeListener(ev, this.socketListensers[ev]);
            }
            let nextState = Object.assign({}, this.state, {
                realtimeData: []
            });

            // nextState.chartSettings.realtime = false;
            this.setState(nextState);
        }

    }
    /*shouldComponentUpdate (nextProps, nextState) { return true; }*/

    lineChart = opts => {
        let realtimeGap = 60; // seconds
        // sensor.advancedSettings#Keys# = ['_id', 'color', 'blink', 'emergency', 'state', 'threshold']
        let { needRefresh, error, rawData, realtimeInit } = opts;

        if (!realtimeInit) realtimeGap = undefined;

        if (this.props.realtime) rawData = this.state.realtimeData;

        let emergencyLimit = null;
        let lineType;
        let registers = [];
        const colors = [red500, purple500, blue500, green500, amber500, brown500, grey500, blueGrey500];

        let settings = [];

        for (let i = 0, l = this.props.sensors.length; i < l; i ++) {
            if (this.state.chartSettings.selectedSensors.some(sId => this.props.sensors[i]._id == sId)) {
                lineType = this.props.sensors[i].type == 'числовой' ? 'linear' : 'step';
                // break;
            }
            if (Array.isArray(this.props.sensors[i].advancedSettings) && this.props.sensors[i].advancedSettings.length) {
                settings = settings.concat(this.props.sensors[i].advancedSettings);
            }
        }

        let srMap = {};

        for (let i = 0, l = this.props.sensors.length; i < l; i ++) {
            let sensor = this.props.sensors[i];

            for (let ii = 0, ll = this.state.chartSettings.selectedSensors.length; ii < ll; ii++) {
                let selectedSId = this.state.chartSettings.selectedSensors[ii];
                if (selectedSId == sensor._id) {

                    if (realtimeInit && realtimeGap) {
                        sensor.registers.forEach(r => {
                            srMap[r] = sensor._id;
                        });
                    }

                    registers = registers.concat(sensor.registers);
                }
            }
        }
        console.log('srMap =', srMap)
        console.log('registers =', registers)



        let self = this;
        const lines = () => {
            return registers.map((r, i) => {
                return <Line isAnimationActive={!self.props.realtime} connectNulls={true} key={r} legendType="rect" type={lineType} dataKey={'Регистр ' + r} stroke={colors[i] || red500} activeDot={{ r: 6 }} />
                {/*return <Line isAnimationActive={!self.state.chartSettings.realtime} connectNulls={true} key={r} dot={<LineDot/>} legendType="rect" type={lineType} dataKey={'Регистр ' + r} stroke={colors[i] || red500} activeDot={{ r: 6 }} />*/}
            })
        };


        let data = [];
        let timeMap = {};



        let xAxisFormatStr = moment(this.props.dateEnd).isAfter(moment(this.props.dateStart), 'day') ? 'DD.MM / HH:mm:ss' : 'HH:mm:ss';
        if (this.props.realtime) xAxisFormatStr = 'HH:mm:ss';

        // xAxisFormatStr = 'HH:mm:ss:ms'

        function findPrev (r, v, dataIndex) {
            let regValue = undefined;
            let i = dataIndex;
            let j = dataIndex;

            while (i >= 0) {
                if (rawData[i].r && (rawData[i].r == r) && ('r_v' in rawData[i])) {
                    if (rawData[i].r_v === null) {
                        regValue = null;
                        break;
                    } else {
                        regValue = Number((rawData[i].r_v).toFixed(2));
                        break;
                    }
                }
                --i;
            }

            if (regValue == undefined) {
                let l = rawData.length;

                while (j < l) {
                    let mTime = moment(rawData[j].dt).format(xAxisFormatStr/*'DD-MM-YYYY HH:mm:ss'*/);

                    if (timeMap[mTime] && (rawData[j].r == r) && ('r_v' in rawData[j])) {
                        if (rawData[j].r_v === null) {
                            regValue = null;
                            break;
                        } else {
                            regValue = Number((rawData[j].r_v).toFixed(2));
                            break;
                        }

                    }

                    ++j;
                }

            }

            return regValue;
        }

        let emergency = false;


        // if (realtimeInit && realtimeGap && this.state.chartSettings.realtime) {
        //     let rawData = [];
        //     let now = (Date.now()) - 10000;
        //     while (realtimeGap) {
        //         let emptyChunk;
        //
        //         for (let r in srMap) {
        //             console.log('RRR ==', r)
        //             emptyChunk = {
        //                 p_id: this.props.pId + '',
        //                 d_id: this.props.dId + '',
        //                 dt: new Date(now - (1000 * realtimeGap)) // 1500ms
        //             };
        //             emptyChunk.r = r + '';
        //             emptyChunk.r_v = null;
        //             emptyChunk.s_id = srMap[r] + '';
        //             rawData.unshift(emptyChunk);
        //         }
        //
        //         --realtimeGap;
        //     }
        //
        //     realtimeInit = undefined;
        //
        //     console.log('rawData =', rawData)
        //
        //     this.setState(Object.assign({}, this.state, {
        //         realtimeData: rawData
        //     }));
        //
        //     return;
        // }

        console.log('rawData =', rawData)

        for (let i = 0, l = rawData.length; i < l; i++) {
            let propDataChunk = rawData[i];
            let mTime = moment(propDataChunk.dt).format(xAxisFormatStr/*'DD-MM-YYYY HH:mm:ss'*/);

            if (timeMap[mTime]) continue;

            timeMap[mTime] = true;

            let dataChunk = { name: moment(propDataChunk.dt).format(xAxisFormatStr), ['Регистр ' + propDataChunk.r]: (propDataChunk.r_v !== null || propDataChunk.r_v !== undefined) ? Number((propDataChunk.r_v).toFixed(2)) : null, [propDataChunk.r]: propDataChunk.r_v ? Number((propDataChunk.r_v).toFixed(2)) : null };

            /*for (let ii = 0, ll = registers.length; ii < ll; ii++) {
                if (propDataChunk.r != registers[ii]) {
                    let rv = findPrev(registers[ii], null, ii);
                    dataChunk['Регистр ' + registers[ii]] = rv;
                    dataChunk[registers[ii]] = rv;
                }
            }*/

            for (let ii = 0, ll = settings.length; ii < ll; ii++) {
                let setting = settings[ii];
                // if (!setting.emergency) continue;
                let rMap = [];
                for (let k in dataChunk) {
                    if (setting[k]) {
                        rMap.push(k);
                    }
                }
                let settingCondition;
                rMap.forEach(rs => {
                    let min = setting[rs] - ((setting[rs] / 100) * (setting.threshold || 1)); // 270
                    let max = setting[rs] + ((setting[rs] / 100) * (setting.threshold || 1)); // 330
                    // 220;
                    // ['_id', 'color', 'blink', 'emergency', 'state', 'threshold']
                    if ((rs in dataChunk)) {
                        if (dataChunk[rs] <= max && dataChunk[rs] >= min) {
                            settingCondition = true;
                        } else  {
                            settingCondition = false;
                        }
                    } else {
                        settingCondition = false;
                    }
                });
                if (settingCondition) {
                    emergency = setting.emergency;
                    dataChunk.emergency = setting.emergency;
                    dataChunk.blink = setting.blink;
                    dataChunk.state = setting.state;
                    dataChunk.color = setting.color;
                }
            }

            data.push(dataChunk);
        }

        if (this.props.realtime && data.length) {
            let lastDT = data[data.length - 1].name;
            let to;

            for (let i = 0, l = data.length; i < l; i++) {
                let dt = data[i].name;
                let diff = moment( '01-01-1970 ' + lastDT).diff(moment('01-01-1970 ' + dt), 'minutes');
                if (diff >= 1) {
                    to = i;
                } else {
                    break;
                }
            }
            if (to != undefined) {
                data.splice(0, to + 1)
            }

            if (data.length > 60) {
                data = data.slice(-60)
            }
        }

        return <ResponsiveContainer
            debounce={0}
            className={ styles['sensor-chart__body-in'] + (needRefresh ? ' ' + styles['need-refresh'] : '') + (error ? ' ' + styles.error : '') + (emergency ? ' ' + styles.emergency : '') }
        >
            <LineChart
                syncId={this.props.syncId}
                data={data}
                margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
            >
                <XAxis minTickGap={50} dataKey="name" />
                <YAxis domain={lineType == 'step' ? ['dataMin - 1', 'dataMax + 1'] : ['auto', 'auto']}/>

                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip
                    content={<ChartTooltip/>}
                    labelStyle={{
                        textAlign: 'center',
                        borderBottom: '1px solid'
                    }}
                />
                <Legend />
                {lines()}
            </LineChart>
        </ResponsiveContainer>
    };

    chartSettingsChange = (k, v) => {
        // if (this.state.chartSettings.realtime) {
        //     this.realtime(false);
        //     // this.chartSettingsChange('realtime', val);
        // }
        this.setState(Object.assign({}, this.state, {
            needRefresh: true,
            chartSettings: Object.assign({}, this.state.chartSettings, {
                [k]: v
            })
        }))
    };

    submit = () => {
        // let from = this.state.chartSettings.dateStart;
        let from = this.props.dateStart;
            from.setHours(this.props.timeStart.getHours());
            from.setMinutes(this.props.timeStart.getMinutes());
            from.setSeconds(this.props.timeStart.getSeconds());

        // let to = this.state.chartSettings.dateEnd;
        let to = this.props.dateEnd;
            // if (this.state.chartSettings.timeEnd) {
            if (this.props.timeEnd) {
                to.setHours(this.props.timeEnd.getHours());
                to.setMinutes(this.props.timeEnd.getMinutes());
                to.setSeconds(this.props.timeEnd.getSeconds());
            }
        this.props.submit({
            dataSource: this.props.dataSource,
            projectId: this.props.pId,
            deviceId: this.props.dId,
            sensors: this.state.chartSettings.selectedSensors,
            chartId: this.props._id,
            from: from.getTime(),
            to: to.getTime()
        });
    };



    render () {
        const realtime              = this.props.realtime;
        const chartHeight           = this.state.chartHeight;
        const chartHeaderHeight     = 50;
        const minChartBodyHeight    = 120;
        const chartBodyHeight       = chartHeight - chartHeaderHeight < minChartBodyHeight ? minChartBodyHeight - 20 + 'px' : (chartHeight - chartHeaderHeight) -20 + 'px';

        let needRefresh         = realtime ? false : (this.state.needRefresh || !this.state.chartSettings.selectedSensors.length);
        let loading             = realtime ? false : this.props.loading;
        let error               = this.props.error;
        let selectedSensorsType = null;

        let chartTitle = '';
        let selectedSensors = this.state.chartSettings.selectedSensors;

        if (Array.isArray(this.state.chartSettings.selectedSensors) && this.state.chartSettings.selectedSensors.length) {
            for (let i = 0, l = this.props.sensors.length; i < l; i++) {
                if (this.state.chartSettings.selectedSensors[0] == this.props.sensors[i]._id) {
                    selectedSensorsType = this.props.sensors[i].type;
                    // break;
                }

                for (let ii = 0, ll = this.state.chartSettings.selectedSensors.length; ii < ll; ii++) {
                    if (this.state.chartSettings.selectedSensors[ii] == this.props.sensors[i]._id) {
                        chartTitle += this.props.sensors[i].title.toUpperCase() + ', ';
                    }
                }
            }
        }

        chartTitle = chartTitle.replace(/,\s$/, '');

        const sensorsSelector = (
            <IconMenu
                disabled={realtime || loading || !this.props.sensors || !this.props.sensors.length}
                multiple={true}
                value={this.state.chartSettings.selectedSensors}
                onChange={ (ev, v) => {
                    this.chartSettingsChange('selectedSensors', v);
                } }
                iconButtonElement={
                    <IconButton
                        disabled={realtime || loading || !this.props.sensors || !this.props.sensors.length}
                        iconStyle={{ width: 40, height: 40 }}
                        style={{ width: 60, height: 60 }}
                        tooltipPosition="bottom-right"
                        tooltip="Выбор датчиков"
                    >
                        <SensorIcon color={cyan500}/>
                    </IconButton>
                }
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
            >
                { this.props.sensors.map(s => {
                    return <MenuItem
                        key={s._id}
                        leftIcon={<Avatar src={ s.img }/>}
                        disabled={selectedSensorsType && selectedSensorsType != s.type}
                        value={s._id}
                        primaryText={s.title.toUpperCase() + (s.type ? ' - ' + s.type.toLowerCase() + ' (' + s.measure + ')' : '')}
                    />
                }) }
            </IconMenu>
        );

        const advanced = (
            <IconButton
                iconStyle={{ width: 30, height: 30 }}
                style={{ width: 50, height: 50 }}
                tooltipPosition="bottom-left"
                tooltip="Настройки индикации"
            >
                <SettingstIcon color={cyan500}/>
            </IconButton>
        );


        return (
            <div className={ styles['sensor-chart'] }>
                <div className={ styles['sensor-chart__header'] }>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignSelf: 'stretch' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            { sensorsSelector }
                            <p style={{ paddingTop: '20px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {chartTitle}
                            </p>
                            <div>
                                { advanced }
                                <IconButton
                                    style={{ verticalAlign: 'top' }}
                                    onClick={() => {
                                        this.props.remove(this.props._id);
                                    }}
                                    disabled={loading}
                                    tooltipPosition="bottom-left"
                                    tooltip="Удалить график"
                                >

                                    <RemoveIcon color={red500}/>
                                </IconButton>
                            </div>
                        </div>
                    </div>
                    <div style={{ paddingLeft: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', alignSelf: 'stretch', maxWidth: '960px' }}>
                        {/*<div style={{ display: 'flex', alignItems: 'flex-end', maxWidth: '960px', overflow: 'visible' }}>*/}
                            {/*<DatePicker*/}
                                {/*style={{ display: 'inline-block', maxWidth: '90px', overflowX: 'hidden' }}*/}
                                {/*disabled={realtime || loading}*/}
                                {/*onChange={ (_null, date) => {*/}
                                    {/*this.chartSettingsChange('dateStart', date)*/}
                                {/*} }*/}
                                {/*autoOk={ false }*/}
                                {/*cancelLabel="Отмена"*/}
                                {/*hintText="∞"*/}
                                {/*floatingLabelText={realtime ? "∞" : "начальная дата"}*/}
                                {/*defaultDate={ realtime ? null : this.state.chartSettings.dateStart }*/}
                                {/*value={ realtime ? null : this.state.chartSettings.dateStart }*/}
                                {/*disableYearSelection={ true }*/}
                                {/*maxDate={ new Date() }*/}
                                {/*DateTimeFormat={intl.DateTimeFormat}*/}
                                {/*locale="ru"*/}
                            {/*/>*/}
                            {/*<TimePicker*/}
                                {/*hintText="∞"*/}
                                {/*style={{ display: 'inline-block', maxWidth: '45px', overflowX: 'hidden' }}*/}
                                {/*disabled={ realtime || loading}*/}
                                {/*format="24hr"*/}
                                {/*defaultTime={ realtime ? null : this.state.chartSettings.timeStart }*/}
                                {/*value={ realtime ? null : this.state.chartSettings.timeStart }*/}
                                {/*onChange={ (_null, date) => {*/}
                                    {/*this.chartSettingsChange('timeStart', date);*/}
                                {/*} }*/}
                                {/*cancelLabel="Отмена"*/}
                            {/*/>*/}
                        {/*<div style={{ display: 'inline-block', margin: '0px 8px',  position: 'relative', top: '-8px', height: '45px', borderRight: '1px solid #ccc' }}></div>*/}
                            {/*<DatePicker*/}
                                {/*hintText="∞"*/}
                                {/*style={{ display: 'inline-block', maxWidth: '90px', overflowX: 'hidden' }}*/}
                                {/*disabled={realtime || loading}*/}
                                {/*onChange={ (_null, date) => {*/}
                                    {/*this.chartSettingsChange('dateEnd', date)*/}
                                {/*} }*/}
                                {/*autoOk={ false }*/}
                                {/*floatingLabelText={realtime ? "∞" : "конечная дата"}*/}
                                {/*cancelLabel="Отмена"*/}
                                {/*defaultDate={ realtime ? null : this.state.chartSettings.dateEnd }*/}
                                {/*disableYearSelection={ true }*/}
                                {/*maxDate={ new Date() }*/}
                                {/*value={ realtime ? null : this.state.chartSettings.dateEnd }*/}
                                {/*DateTimeFormat={intl.DateTimeFormat}*/}
                                {/*locale="ru"*/}
                            {/*/>*/}
                            {/*<TimePicker*/}
                                {/*hintText="∞"*/}
                                {/*style={{ display: 'inline-block', maxWidth: '45px', overflowX: 'hidden' }}*/}
                                {/*disabled={realtime || loading}*/}
                                {/*format="24hr"*/}
                                {/*defaultTime={ realtime ? null : this.state.chartSettings.timeEnd }*/}
                                {/*value={ realtime ? null : this.state.chartSettings.timeEnd }*/}
                                {/*onChange={ (_null, date) => {*/}
                                    {/*this.chartSettingsChange('timeEnd', date)*/}
                                {/*} }*/}
                                {/*cancelLabel="Отмена"*/}
                            {/*/>*/}
                            {/*&nbsp;*/}
                            {/*&nbsp;*/}
                            {/*<IconButton*/}
                                {/*disabled={!selectedSensors.length || loading || !this.props.sensors}*/}
                                {/*iconStyle={{ position: 'absolute', top: '0px', left: '0px', width: 40, height: 40 }}*/}
                                {/*style={{ position: 'relative', width: 40, height: 40 }}*/}
                                {/*tooltipPosition="top-right"*/}
                                {/*tooltip="Режим реального времени"*/}
                                {/*onClick={ ev => {*/}
                                    {/*let val = !this.state.chartSettings.realtime;*/}
                                    {/*this.realtime(val);*/}
                                {/*} }*/}
                            {/*>*/}
                                {/*<TimelineIcon color={this.state.chartSettings.realtime ? cyan500 : null} />*/}
                            {/*</IconButton>*/}
                            {/*&nbsp;*/}
                        {/*</div>*/}
                       {/* <div style={{ display: 'flex', width: '130px'}}>
                            <RadioButtonGroup
                                name="chartDataSrcType"
                                defaultSelected={this.state.chartSettings.dataSource}
                                onChange={ (ev, v) => {
                                    this.chartSettingsChange('dataSource', v);
                                } }
                            >
                                <RadioButton
                                    disabled={realtime || loading}
                                    value="changelog"
                                    label="Изменения"
                                    style={{ display: 'inline-block' }}
                                />
                                <RadioButton
                                    style={{ display: 'inline-block' }}
                                    disabled={realtime || loading}
                                    value="log"
                                    label="Логи"
                                />
                            </RadioButtonGroup>
                        </div>*/}
                    </div>
                </div>
                <div className={ styles['sensor-chart__body'] }
                     style={{ width: this.state.chartWidth + 'px', height: chartBodyHeight }}
                >
                    {
                        loading ? <RefreshIndicator
                            className={ styles['sensor-chart__body-refresh'] }
                            size={40}
                            left={(this.state.chartWidth / 2) - 20}
                            top={(parseInt(chartBodyHeight) / 2) - 20}
                            status="loading"
                        /> : needRefresh ? <FloatingActionButton
                            onClick={this.submit}
                            disabled={!this.state.chartSettings.selectedSensors || !this.state.chartSettings.selectedSensors.length}
                            className={ styles['sensor-chart__body-refresh'] }
                            mini={true}
                        >
                            <RefreshIcon/>
                        </FloatingActionButton> : null
                    }

                    { this.lineChart({ realtimeInit: realtime && !this.state.realtimeData.length, needRefresh, error, rawData: realtime ? this.state.realtimeData : this.props.data  }) }

                </div>
            </div>
        );
    }
}