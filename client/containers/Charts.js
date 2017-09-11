'use strict';


import React, { Component }     from 'react';
import PropTypes                from 'prop-types';


import SelectField              from 'material-ui/SelectField';
import IconMenu                 from 'material-ui/IconMenu';
import MenuItem                 from 'material-ui/MenuItem';
import RaisedButton             from 'material-ui/RaisedButton';
import IconButton               from 'material-ui/IconButton';
import Divider                  from 'material-ui/Divider';
import ArrowDropRight           from 'material-ui/svg-icons/navigation-arrow-drop-right';
import MoreHorizIcon            from 'material-ui/svg-icons/navigation/more-horiz';
import PlusIcon                 from 'material-ui/svg-icons/content/add';
import TimelineIcon                                                      from 'material-ui/svg-icons/action/timeline';
import TouchIcon                from 'material-ui/svg-icons/action/touch-app';
import SyncIcon                from 'material-ui/svg-icons/notification/sync';
import ColumnsIcon                from 'material-ui/svg-icons/action/view-stream';
import FullscreenIcon                from 'material-ui/svg-icons/action/settings-overscan';
import { cyan500, red500, purple500, blue500, green500, amber500, brown500, grey500, blueGrey500} from 'material-ui/styles/colors';
import DatePicker                                                        from 'material-ui/DatePicker';
import TimePicker                                                        from 'material-ui/TimePicker';
import { RadioButton, RadioButtonGroup }                                 from 'material-ui/RadioButton';
import SensorChart              from '../components/sensorChart/index.js';
import SensorChartV2              from '../components/sensorChartV2/index.js';
import intl                                                              from 'intl';
import 'intl/locale-data/jsonp/ru-RU.js';

import { connect }              from 'react-redux';
import * as AT                  from '../actions/constants';
import * as ACTIONS             from '../actions';

import moment from 'moment';

window.moment = moment;
@connect(
    state => {
        const { common, changelog, projects, charts } = state;
        return { common, changelog, projects, charts };
    }, ACTIONS
)
export default class Charts extends Component {
    constructor (...props) {
        super(...props);
        this.state = {};

    }

    static defaultProps = {};
    static propTypes = {
        common: PropTypes.object,
        projects: PropTypes.object,
        charts: PropTypes.object,
        changelog: PropTypes.object,
        chartProjectDeviceSelect: PropTypes.func,
        changeChartsSettings: PropTypes.func,
        chartSync: PropTypes.func,
        changeViewMode: PropTypes.func,
        chartAdd: PropTypes.func,
        chartRemove: PropTypes.func,
        selectChartSensors: PropTypes.func,
        chartsDataUpdate: PropTypes.func,
        toggleChartInterpolate: PropTypes.func,
        changeLogRead: PropTypes.func,
        dictionaryRead: PropTypes.func,
        socket: PropTypes.object
    };

    _toggleChartInterpolate = chartId => {
        this.props.toggleChartInterpolate(chartId);
    };

    socketListensers = {
        [AT.CHANGELOG + AT.DATA + AT._READ + AT._SUCCESS]: data => {
            let { charts, realtime, dataSource}     = this.props.charts;
            const selectedProjectId                 = this.props.charts.selectedProject;
            const selectedDeviceId                  = this.props.charts.selectedDevice;

            let chartsToUpdate = [];

            for (let i = 0, l = charts.length; i < l; i++) {
                let chart = charts[i];
                if (Array.isArray(chart.selectedSensorsId) && chart.selectedSensorsId.some(id => id === data.s_id)) {
                    let _data = chart.data.map(d => Object.assign(d));
                        _data.push(data);

                    if (realtime) {
                        _data = _data.filter(d => {

                            let diff = moment().diff(moment(d.dt).subtract(1, 'minutes'), 'minutes');

                            return !(diff > 1);
                        });
                    }

                    chartsToUpdate.push({
                        chartId: chart._id,
                        data: _data
                    });
                }
            }

            if (chartsToUpdate.length) {
                this.props.chartsDataUpdate(chartsToUpdate)
            }
        },
        [AT.LOG + AT.DATA + AT._READ + AT._SUCCESS]: data => {
            let { charts, realtime, dataSource}     = this.props.charts;
            const selectedProjectId                 = this.props.charts.selectedProject;
            const selectedDeviceId                  = this.props.charts.selectedDevice;

            let chartsToUpdate = [];

            for (let i = 0, l = charts.length; i < l; i++) {
                let chart = charts[i];
                if (Array.isArray(chart.selectedSensorsId) && chart.selectedSensorsId.some(id => id === data.s_id)) {
                    let _data = chart.data.map(d => Object.assign(d));
                    _data.push(data);

                    if (realtime) {
                        _data = _data.filter(d => {
                            // console.log('d._dt =', d.dt)
                            let diff = moment().diff(moment(d.dt).subtract(1, 'minutes'), 'minutes');

                            return !(diff > 1);
                        });
                    }

                    chartsToUpdate.push({
                        chartId: chart._id,
                        data: _data
                    });
                }
            }

            if (chartsToUpdate.length) {
                this.props.chartsDataUpdate(chartsToUpdate)
            }
        }
    };

    realtimeHandler = realtime => {

        let { charts, dataSource } = this.props.charts;
        const selectedProjectId    = this.props.charts.selectedProject;
        const selectedDeviceId     = this.props.charts.selectedDevice;

        let sensorsId = [];

        charts.forEach(chart => {
            if (Array.isArray(chart.selectedSensorsId) && chart.selectedSensorsId.length) {
                sensorsId = sensorsId.concat(chart.selectedSensorsId)
            }
        });

        let ev = dataSource == 'changelog' ? AT.CHANGELOG : AT.LOG;

        if (realtime) {
            ev += AT._JOIN;

            for (let sEv in this.socketListensers) {
                this.props.socket.on(sEv, this.socketListensers[sEv]);
            }
        } else {
            ev += AT._LEAVE;

            for (let sEv in this.socketListensers) {
                this.props.socket.removeListener(sEv, this.socketListensers[sEv]);
            }
        }

        this.props.socket.emit(ev, {
            projectId: selectedProjectId,
            deviceId: selectedDeviceId,
            sensorsId: sensorsId
        });

    };

    _changeLogRead = chartId => {
        const { charts, dataSource, dateStart, dateEnd, timeStart, timeEnd }    = this.props.charts;
        const selectedProjectId                                                 = this.props.charts.selectedProject;
        const selectedDeviceId                                                  = this.props.charts.selectedDevice;
        let from, to;

        let data = {};
            data.chartId    = chartId;
            data.dataSource = dataSource;
            data.projectId  = selectedProjectId;
            data.deviceId   = selectedDeviceId;

        for (let i = 0, l = charts.length; i < l; i++) {
            let chart = charts[i];

            if (chart._id == chartId) {
                data.sensors = chart.selectedSensorsId;
                break;
            }
        }

        from = dateStart;
        from.setHours(timeStart.getHours());
        from.setMinutes(timeStart.getMinutes());
        from.setSeconds(timeStart.getSeconds());

        to = dateEnd;
        if (timeEnd) {
            to.setHours(timeEnd.getHours());
            to.setMinutes(timeEnd.getMinutes());
            to.setSeconds(timeEnd.getSeconds());
        }

        data.from   = from.getTime();
        data.to     = to.getTime();

        this.props.changeLogRead(data);
    };

    _selectChartSensors = (chartId, ev, v) => {
        this.props.selectChartSensors({
            chartId,
            sensorsId: v
        });
    };

    componentDidMount () {
        if (!this.props.projects.items.length) this.props.dictionaryRead('project');

        for (let ev in this.socketListensers) {
            this.props.socket.on(ev, this.socketListensers[ev]);
        }
        const chartContainerWidth   = parseInt(window.getComputedStyle(document.querySelector('#appContent')).width);
        const chartContainerHeight  = parseInt(window.getComputedStyle(document.querySelector('#appContent')).height) - 55;
        let self = this;
        let resizeTimer;

        self.setState(Object.assign({}, self.state, { chartContainerWidth, chartContainerHeight }));

        window.addEventListener('resize', ev => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                const chartContainerWidth   = parseInt(window.getComputedStyle(document.querySelector('#appContent')).width);
                const chartContainerHeight  = parseInt(window.getComputedStyle(document.querySelector('#appContent')).height) - 55;
                self.setState(Object.assign({}, self.state, { chartContainerWidth, chartContainerHeight }));
            }, 150);
        });
    }

    componentWillUnmount () {
        for (let ev in this.socketListensers) {
            this.props.socket.removeListener(ev, this.socketListensers[ev]);
        }
        this.realtimeHandler(false);
    }

    /*componentWillReceiveProps (props) { }*/
    /*shouldComponentUpdate (nextProps, nextState) { return true; }*/
    render () {

        const chartContainerWidth   = this.state.chartContainerWidth;
        const chartContainerHeight  = this.state.chartContainerHeight;
        const projects              = this.props.projects.items;

        let selectedProject         = this.props.charts.selectedProject;
        let selectedDevice          = this.props.charts.selectedDevice;

        let selectedProjectTitle    = 'Проект';
        let selectedDeviceTitle     = 'Устройство';

        let sensors = [];

        const {dateStart, dateEnd, timeStart, timeEnd, realtime, dataSource} = this.props.charts;

        let timeFormatStr = moment(this.props.dateEnd).isAfter(moment(this.props.dateStart), 'day') ? 'DD.MM / HH:mm:ss' : 'HH:mm:ss';

        if (Array.isArray(projects)) {
            projects.forEach(p => {
                if (p._id == selectedProject) {
                    selectedProjectTitle = p.title;
                    if (Array.isArray(p.devices)) {
                        p.devices.forEach(d => {
                            if (d._id == selectedDevice) {
                                selectedDeviceTitle = d.title;
                                if (Array.isArray(d.sensors)) sensors = d.sensors;
                            }
                        })
                    }
                }
            });
        }
        /*devices
            :
            [{…}]
        last_updated_at
            :
            "2017-08-28T13:03:53.244Z"
        last_updated_by
            :
            "591d01a356e5e51a084c3831"
        title
            :
            "Проект №1"*/
        const changelog             = this.props.changelog.data;

        let projectDeviceSelector = (
            <IconMenu
                disabled={!projects || !projects.length}
                multiple={false}
                value={selectedProject}
                iconButtonElement={
                    <RaisedButton
                        onClick={() => {}} label={ selectedProjectTitle + " → " + selectedDeviceTitle }
                        primary={true}
                        icon={<TouchIcon style={{ position: 'relative', top: '-3px' }}/>}
                    />
                }
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
            >
                { projects.map(p => {
                    return <MenuItem
                        key={p._id}
                        value={p._id}
                        primaryText={p.title}
                        rightIcon={<ArrowDropRight />}
                        menuItems={
                            p.devices.map(d => {
                                return <MenuItem
                                    key={d._id}
                                    value={d._id}
                                    checked={d._id == selectedDevice}
                                    primaryText={d.title}
                                    onClick={() => {
                                        this.props.chartProjectDeviceSelect({
                                            projectId: p._id,
                                            deviceId: d._id,
                                            sensors: d.sensors
                                        })
                                    }}
                                />
                            })}
                    />
                }) }
        </IconMenu>);

        let charts = this.props.charts.charts.map((chart, i) => {
            let w,h;

            w = chartContainerWidth;
            h = chartContainerHeight;

            if (this.props.charts.viewMode == 'auto') {
                if (chartContainerWidth <= 990) {
                    w = chartContainerWidth;
                    h = chartContainerHeight;
                } else if (i == 0) {
                    if (this.props.charts.charts.length == 1) {
                        w = chartContainerWidth;
                        h = chartContainerHeight;
                    } else if (this.props.charts.charts.length == 2) {
                        w = chartContainerWidth <= 990 ? chartContainerWidth : chartContainerWidth / 2;
                        h = chartContainerHeight;
                    } else {
                        w = chartContainerWidth / 2;
                        w = chartContainerWidth <= 990 ? chartContainerWidth : chartContainerWidth / 2;
                        h = chartContainerHeight / 2;
                    }
                } else {
                    w = ((this.props.charts.charts.length - 1) == i) && (i % 2 != 1) ? chartContainerWidth : chartContainerWidth / 2;
                    h = this.props.charts.charts.length == 2 ? chartContainerHeight : chartContainerHeight / 2;
                }
            } else if (this.props.charts.viewMode == '1') {
                w = chartContainerWidth;
                h = chartContainerHeight;
            } else if (this.props.charts.viewMode == '2-V') {
                if (this.props.charts.charts.length > 1) {
                    w = chartContainerWidth / 2;
                    h = chartContainerHeight;
                }
            } else if (this.props.charts.viewMode == '2-H') {
                if (this.props.charts.charts.length > 1) {
                    w = chartContainerWidth;
                    h = chartContainerHeight / 2;
                }
            }
            return (<SensorChartV2
                key={chart._id}
                _id={chart._id}
                syncId={this.props.charts.sync ? 'sync' : null}
                interpolate={chart.interpolate}
                toggleInterpolate={this._toggleChartInterpolate.bind(this, chart._id)}
                submit={this._changeLogRead.bind(this, chart._id)}
                remove={this.props.chartRemove.bind(this, chart._id)}
                selectSensors={this._selectChartSensors.bind(this, chart._id)}
                width={w} height={h}
                data={chart.data}
                sensors={sensors}
                selectedSensorsId={chart.selectedSensorsId}
                timeFormatStr={timeFormatStr}
                isLoading={chart.isLoading}
                needRefresh={chart.needRefresh}
                error={chart.error}
                disabled={realtime}
            />);

            return <SensorChart
                selectSensor={this.props.selectChartSensors}
                dateStart={dateStart} dateEnd={dateEnd} timeStart={timeStart} timeEnd={timeEnd}
                realtime={realtime}
                dataSource={dataSource}
                syncId={this.props.charts.sync ? 'sync' : null}
                socket={this.props.socket}
                key={chart._id}
                data={chart.data || []}
                pId={selectedProject}
                dId={selectedDevice}
                sensors={sensors}
                error={chart.error}
                submit={this.props.changeLogRead}
                _id={chart._id}
                remove={this.props.chartRemove}
                loading={chart.isLoading}
                width={w} height={h} />
        });

        const syncEnabled = false;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', flexGrow: '1' }}>
                <div style={{ display: 'flex', paddingLeft: '10px', paddingRight: '10px', justifyContent: 'space-between', alignItems: 'center', minHeight: '55px' }}>
                    {projectDeviceSelector}
                    <div style={{ display: 'flex', alignItems: 'flex-end', maxWidth: '960px', overflow: 'visible' }}>
                        <DatePicker
                            style={{ display: 'inline-block', maxWidth: '90px', overflowX: 'hidden' }}
                            disabled={!sensors || !sensors.length || !charts.length}
                            onChange={ (_null, date) => {
                                this.props.changeChartsSettings({
                                    dateStart: date
                                })
                            } }
                            defaultDate={ this.props.charts.realtime ? null : this.props.charts.dateStart }
                            value={ this.props.charts.realtime ? null : this.props.charts.dateStart }

                            autoOk={ false }
                            cancelLabel="Отмена"
                            hintText="∞"
                            floatingLabelText={this.props.charts.realtime ? "∞" : "начальная дата"}
                            disableYearSelection={ true }
                            maxDate={ this.props.charts.dateEnd || new Date() }
                            DateTimeFormat={intl.DateTimeFormat}
                            locale="ru"
                        />
                        <TimePicker
                            hintText="∞"
                            style={{ display: 'inline-block', maxWidth: '45px', overflowX: 'hidden' }}
                            disabled={!sensors || !sensors.length || !charts.length}
                            format="24hr"
                            defaultTime={ this.props.charts.realtime ? null : this.props.charts.timeStart }
                            value={ this.props.charts.realtime ? null : this.props.charts.timeStart }
                            onChange={ (_null, date) => {
                                this.props.changeChartsSettings({
                                    timeStart: date
                                })
                            } }
                            cancelLabel="Отмена"
                        />
                        <div style={{ display: 'inline-block', margin: '0px 8px',  position: 'relative', top: '-8px', height: '30px', borderRight: '1px solid #ccc' }}></div>
                        <DatePicker
                            hintText="∞"
                            style={{ display: 'inline-block', maxWidth: '90px', overflowX: 'hidden' }}
                            disabled={!sensors || !sensors.length || !charts.length}
                            onChange={ (_null, date) => {
                                this.props.changeChartsSettings({
                                    dateEnd: date
                                })
                            } }
                            defaultDate={ this.props.charts.realtime ? null : this.props.charts.dateEnd }
                            value={ this.props.charts.realtime ? null : this.props.charts.dateEnd }
                            autoOk={ false }
                            floatingLabelText={this.props.charts.realtime ? "∞" : "конечная дата"}
                            cancelLabel="Отмена"
                            disableYearSelection={ true }
                            minDate={ this.props.charts.dateStart || null }
                            maxDate={ new Date() }
                            DateTimeFormat={intl.DateTimeFormat}
                            locale="ru"
                        />
                        <TimePicker
                            hintText="∞"
                            defaultTime={ this.props.charts.realtime ? null : this.props.charts.timeEnd }
                            value={ this.props.charts.realtime ? null : this.props.charts.timeEnd }
                            onChange={ (_null, date) => {
                                this.props.changeChartsSettings({
                                    timeEnd: date
                                })
                            } }
                            style={{ display: 'inline-block', maxWidth: '45px', overflowX: 'hidden' }}
                            disabled={!sensors || !sensors.length || !charts.length}
                            format="24hr"
                            cancelLabel="Отмена"
                        />
                        &nbsp;
                        <IconButton
                            disabled={!sensors || !sensors.length || !charts.length}
                            iconStyle={{ position: 'absolute', top: '0px', left: '0px', width: 40, height: 40 }}
                            style={{ position: 'relative', width: 40, height: 40 }}
                            tooltipPosition="top-left"
                            tooltip="Режим реального времени"
                            onClick={ ev => {
                                this.realtimeHandler(!this.props.charts.realtime);

                                this.props.changeChartsSettings({
                                    realtime: !this.props.charts.realtime
                                });
                            } }
                        >
                            <TimelineIcon color={this.props.charts.realtime ? cyan500 : null} />
                        </IconButton>
                        &nbsp;
                    </div>
                    <div style={{ display: 'flex', width: '130px'}}>
                        <RadioButtonGroup
                            name="chartDataSrcType"
                            defaultSelected={this.props.charts.dataSource}
                            onChange={ (ev, v) => {
                                this.props.changeChartsSettings({
                                    dataSource: v
                                })
                            } }
                        >
                            <RadioButton
                                disabled={this.props.charts.realtime || !sensors || !sensors.length || !charts.length}
                                value="changelog"
                                label="Изменения"
                                style={{ display: 'inline-block' }}
                            />
                            <RadioButton
                                style={{ display: 'inline-block' }}
                                disabled={this.props.charts.realtime || !sensors || !sensors.length || !charts.length}
                                value="log"
                                label="Логи"
                            />
                        </RadioButtonGroup>
                    </div>
                    <div>
                        <RaisedButton
                            disabled={!sensors || !sensors.length}
                            onClick={() => {
                                this.props.changeViewMode('auto')
                            }}
                            label="АВТО"
                            primary={ this.props.charts.viewMode == 'auto' }
                        />
                        <RaisedButton
                            disabled={!sensors || !sensors.length}
                            onClick={() => {
                                this.props.changeViewMode('1')
                            }}
                            primary={ this.props.charts.viewMode == '1' }
                            icon={<FullscreenIcon style={{ position: 'relative', top: '-2px' }}/>}
                        />
                        <RaisedButton
                            disabled={!sensors || !sensors.length}
                            onClick={() => {
                                this.props.changeViewMode('2-H')
                            }}
                            primary={ this.props.charts.viewMode == '2-H' }
                            icon={<ColumnsIcon style={{ position: 'relative', top: '-2px' }}/>}
                        />

                        <RaisedButton
                            disabled={!sensors || !sensors.length}
                            onClick={() => {
                                this.props.changeViewMode('2-V')
                            }}
                            primary={ this.props.charts.viewMode == '2-V' }
                            icon={<ColumnsIcon style={{ transform: 'rotate(90deg)', position: 'relative', top: '-2px',  }}/>}
                        />
                        &nbsp;
                        &nbsp;
                        {syncEnabled ? <RaisedButton
                            disabled={!sensors || !sensors.length}
                            onClick={() => { this.props.chartSync() }}
                            label=""
                            primary={ this.props.charts.sync }
                            icon={<SyncIcon style={{ position: 'relative', top: '-2px' }}/>}
                        /> : null }
                        <RaisedButton
                            disabled={this.props.charts.realtime || !sensors || !sensors.length}
                            onClick={() => { this.props.chartAdd() }}
                            label="ГРАФИК"
                            primary={true}
                            icon={<PlusIcon style={{ position: 'relative', top: '-2px' }}/>}
                        />
                    </div>
                </div>
                <div
                    className="charts-container" style={{ overflow: 'auto', flexGrow: '1' }}
                >
                    { charts }

                </div>
            </div>
        );
    }
}

