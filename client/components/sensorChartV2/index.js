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
import IconMenu                 from 'material-ui/IconMenu';
import MenuItem                 from 'material-ui/MenuItem';
import RaisedButton             from 'material-ui/RaisedButton';
import IconButton                                                        from 'material-ui/IconButton';
import FloatingActionButton                                              from 'material-ui/FloatingActionButton';
import RefreshIndicator                                                  from 'material-ui/RefreshIndicator';
import Avatar from 'material-ui/Avatar';
import MoreVertIcon                                                      from 'material-ui/svg-icons/navigation/more-vert';
import TimelineIcon                                                      from 'material-ui/svg-icons/action/timeline';
import SettingstIcon                                                     from 'material-ui/svg-icons/action/settings';
import InterpolateIcon                                                   from 'material-ui/svg-icons/social/share';
import SensorIcon                                                        from 'material-ui/svg-icons/hardware/memory';
import RefreshIcon                                                       from 'material-ui/svg-icons/navigation/refresh';
import RemoveIcon                                                        from 'material-ui/svg-icons/action/delete';
import { cyan500, red500, purple500, blue500, green500, amber500, brown500, grey500, blueGrey500} from 'material-ui/styles/colors';
import intl                                                              from 'intl';
import 'intl/locale-data/jsonp/ru-RU.js';


const LineDot = (props) => {
    const {cx, cy, stroke, payload, value} = props;
    console.log('LineDot payload = ', payload)
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
};


// FIXME: заменить на dumb
/*class ChartTooltip extends Component {
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
}*/

const ChartTooltip = ({payload, label, ...rest}) => {
    if (!Array.isArray(payload)) payload = [];
    return (
        <div style={{ backgroundColor: cyan500 }} className={styles['chart-tooltip']}>
            <p className={styles['chart-tooltip__label']}>ВРЕМЯ: {moment(label).format(rest.timeFormatStr)}</p>
            <hr/>
            {payload.map(pld => {
                return <p key={pld.dataKey} className={styles['chart-tooltip__payload']}>{pld.name}: {pld.value}</p>
            })}
        </div>
    );
    return null;
};

// [{ value: 'item name', type: 'line', id: 'ID01' }]
const chartBody = ({syncId, lines, lineType, legendPayload, data, timeFormatStr, needRefresh, emergency, error }) => {
    return <ResponsiveContainer
        debounce={0}
        className={ styles['sensor-chart__body-in'] + (needRefresh ? ' ' + styles['need-refresh'] : '') + (error ? ' ' + styles.error : '') + (emergency ? ' ' + styles.emergency : '') }
    >
        <LineChart
            syncId={syncId}
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
        >
            <XAxis minTickGap={50} dataKey="dt" tickFormatter={tick => {
                return moment(tick).format(timeFormatStr);
            }}/>
            <YAxis tick={lineType == 'step' ? false : true} domain={lineType == 'step' ? ['dataMin - 0.2', 'dataMax + 0.2'] : ['auto', 'auto']}/>

            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip
                content={<ChartTooltip timeFormatStr={timeFormatStr}/>}
                labelStyle={{
                    textAlign: 'center',
                    borderBottom: '1px solid'
                }}
            />
            <Legend payload={legendPayload} />
            {lines}
        </LineChart>
    </ResponsiveContainer>
};

const sensorsSelector = ({ disabled, selectedSensorsId, selectSensors, selectedSensorsType, sensors }) => (
    <IconMenu
        disabled={disabled}
        multiple={true}
        value={selectedSensorsId}
        onChange={selectSensors}
        iconButtonElement={
            <IconButton
                disabled={disabled}
                iconStyle={{ width: 40, height: 40 }}
                style={{ width: 60, height: 60 }}
                tooltipPosition="bottom-right"
                tooltip="ВЫБОР ДАТЧИКОВ"
            >
                <SensorIcon color={cyan500}/>
            </IconButton>
        }
        anchorOrigin={{horizontal: 'left', vertical: 'top'}}
        targetOrigin={{horizontal: 'left', vertical: 'top'}}
    >
        { sensors.map(s => {
            return <MenuItem
                key={s._id}
                leftIcon={<Avatar src={ s.img }/>}
                disabled={selectedSensorsType && selectedSensorsType != s.type}
                value={s._id}
                primaryText={s.title.toUpperCase() + (s.type ? ' - ' + s.type.toLowerCase() + (s.measure ? ' (' + s.measure + ')' : '') : '')}
            />
        }) }
    </IconMenu>
);

const advanced = props => (
    <IconButton
        disabled={props.disabled || null}
        iconStyle={{ width: 30, height: 30 }}
        style={{ width: 50, height: 50 }}
        tooltipPosition="bottom-left"
        tooltip={<div>
            <p>ИНТЕРПОЛЯЦИЯ ПРОМЕЖУТОЧНЫХ ЗНАЧЕНИЙ</p>
            (ПРИ АВАРИИ ПОДСВЕТКА КРАСНЫМ)
        </div>}
        onClick={props.toggleInterpolate}
    >
        <InterpolateIcon color={props.interpolate ? cyan500 : null}/>
    </IconButton>
);

function getRulesAndRegistersFromSensors (sensors, selectedSensorsId) {
    let rules       = [];
    let registers   = [];

    if (Array.isArray(sensors)) {
        for (let i = 0, l = sensors.length; i < l; i ++) {
            if (selectedSensorsId.some(id => id == sensors[i]._id)) {
                if (Array.isArray(sensors[i].advancedSettings) && sensors[i].advancedSettings.length) {
                    rules = rules.concat(sensors[i].advancedSettings);
                }
                if (Array.isArray(sensors[i].registers)) {
                    registers = registers.concat(sensors[i].registers);
                }
            }
        }
    }

    return { rules, registers };
}

const SensorChartV2 = ({ _id, syncId, interpolate, toggleInterpolate, submit, remove, selectSensors, width, height, data, sensors, selectedSensorsId, timeFormatStr, isLoading, needRefresh, error, disabled }) => {

    if (syncId && interpolate) syncId = 'interpolate';
    const { rules, registers } = getRulesAndRegistersFromSensors(sensors, selectedSensorsId);

    let dtFormattedMap = {};

    for (let i = 0, l = data.length; i < l; i++) {
        if (interpolate) {
            let dtFormatted = moment(data[i].dt).format(timeFormatStr);
            if (!dtFormattedMap[dtFormatted]) dtFormattedMap[dtFormatted] = {};
            dtFormattedMap[dtFormatted].dt = data[i].dt;
            dtFormattedMap[dtFormatted]['Регистр ' + data[i].r] = Number(data[i].r_v.toFixed(2));
        } else {
            data[i]['Регистр ' + data[i].r] = Number(data[i].r_v.toFixed(2));
        }
    }


    // console.log('RULES =', rules) // [{256: 200, 258: 200, threshold: 10, color: "#fccb00", state: "Ошибка", emergency: true, blink: null}]
    let emergency = false;
    if (interpolate) {
        if (interpolate && rules.length) {
            for (let ii = 0, ll = rules.length; ii < ll; ii++) {
                let rule = rules[ii];

                for (let _dataChunk in dtFormattedMap) {
                    let dataChunk = dtFormattedMap[_dataChunk];
                    let settingCondition;

                    for (let i = 0, l = registers.length; i < l; i++) {
                        let r = registers[i];
                        let min, max;

                        if (r in rule) {
                            min = rule[r] - ((rule[r] / 100) * (rule.threshold || 1));
                            max = rule[r] + ((rule[r] / 100) * (rule.threshold || 1));

                            let k = 'Регистр ' + r;
                            if ((k in dataChunk)) {
                                if (dataChunk['Регистр ' + r] <= max && dataChunk['Регистр ' + r] >= min) {
                                    settingCondition = true;
                                } else {
                                    settingCondition = false;
                                }
                            } else {
                                settingCondition = false;
                            }
                        }
                    }

                    if (settingCondition) {
                        emergency = rule.emergency || false;
                        dtFormattedMap[_dataChunk].emergency    = rule.emergency;
                        dtFormattedMap[_dataChunk].blink        = rule.blink;
                        dtFormattedMap[_dataChunk].state        = rule.state;
                        dtFormattedMap[_dataChunk].color        = rule.color;
                    }
                }

                /*let settingCondition;
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
                 }*/
            }

            data = Object.values(dtFormattedMap);
        }
    }

        // const chartWidth  = width - 2;
        const chartHeight = height - 6;
        const colors = [red500, purple500, blue500, green500, amber500, brown500, grey500, blueGrey500];

        const lineTypes = {
            'числовой': 'linear',
            'дискретный': 'step'
        };

        let lineType = lineTypes['числовой'];
        let selectedSensorsType = null;

        for (let i = 0, l = sensors.length; i < l; i++) {
            if (selectedSensorsId.some(id => id == sensors[i]._id)) {
                lineType = lineTypes[sensors[i].type];
                selectedSensorsType = sensors[i].type;
                break;
            }
        }


        let legendPayload = [];
        // [{ value: 'item name', type: 'line', id: 'ID01' }]

        const lines = () => {
            return registers.map((r, i) => {
                legendPayload.push({
                    value: r,
                    type: 'rect',
                    id: i,
                    color: colors[i] || red500
                });
                return <Line isAnimationActive={false} dot={<LineDot/>} connectNulls={true} key={r} legendType="rect"
                             type={lineType} dataKey={'Регистр ' + r} stroke={colors[i] || red500} activeDot={{r: 6}}/>;
                {/*return <Line isAnimationActive={!self.state.chartSettings.realtime} connectNulls={true} key={r} dot={<LineDot/>} legendType="rect" type={lineType} dataKey={'Регистр ' + r} stroke={colors[i] || red500} activeDot={{ r: 6 }} />*/
                }
            })
        };

        // let emergency = false;

        let chartTitle = '';

        for (let i = 0, l = sensors.length; i < l; i++) {
            let sensor = sensors[i];

            if (selectedSensorsId.some(sSId => sensor._id == sSId)) {
                chartTitle += sensor.title.toUpperCase() + ', ';
            }
        }

        chartTitle = chartTitle.replace(/,\s$/, '');

        const chartHeaderHeight = 50;
        const minChartBodyHeight = 120;
        const chartBodyHeight = chartHeight - chartHeaderHeight < minChartBodyHeight ? minChartBodyHeight - 20 + 'px' : (chartHeight - chartHeaderHeight) - 20 + 'px';

        return (
            <div className={ styles['sensor-chart'] }>
                <div className={ styles['sensor-chart__header'] }>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignSelf: 'stretch'
                    }}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>

                            {sensorsSelector({
                                disabled,
                                selectedSensorsId,
                                selectSensors,
                                selectedSensorsType,
                                sensors
                            })}

                            <p style={{
                                paddingTop: '20px',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {chartTitle}
                            </p>
                                <div>

                                {/*<FloatingActionButton
                                    onClick={submit}
                                    disabled={disabled || !selectedSensorsId.length || isLoading}
                                    mini={true}
                                >
                                    <RefreshIcon/>
                                </FloatingActionButton>*/}

                                <IconButton
                                    onClick={submit}
                                    disabled={disabled || !selectedSensorsId.length || isLoading}
                                    tooltipPosition="bottom-left"
                                    tooltip="ОБНОВИТЬ ГРАФИК"
                                >
                                    <RefreshIcon color={cyan500}/>
                                </IconButton>

                                { advanced({disabled: false, interpolate, toggleInterpolate}) }
                                <IconButton
                                    style={{verticalAlign: 'top'}}
                                    onClick={remove}
                                    disabled={isLoading || disabled}
                                    tooltipPosition="bottom-left"
                                    tooltip="Удалить график"
                                >

                                    <RemoveIcon color={red500}/>
                                </IconButton>
                            </div>
                        </div>
                    </div>
                    <div style={{
                        paddingLeft: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        alignSelf: 'stretch',
                        maxWidth: '960px'
                    }}>

                    </div>
                </div>
                <div className={ styles['sensor-chart__body'] }
                     style={{width: width - 4 + 'px', height: chartBodyHeight}}
                >
                    {
                        isLoading ? <RefreshIndicator
                            className={ styles['sensor-chart__body-refresh'] }
                            size={40}
                            left={(width / 2) - 20}
                            top={(parseInt(chartBodyHeight) / 2) - 20}
                            status="loading"
                        /> : null
                    }
                    { chartBody({
                        syncId,
                        lines: lines(),
                        lineType,
                        legendPayload,
                        needRefresh,
                        emergency,
                        error,
                        data,
                        timeFormatStr
                    }) }

                </div>
            </div>
        )
};

SensorChartV2.propTypes = {
    _id: PropTypes.string.isRequired,
    syncId: PropTypes.string,
    submit: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    selectSensors: PropTypes.func.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    data: PropTypes.array,
    sensors: PropTypes.array,
    selectedSensorsId: PropTypes.array,
    timeFormatStr: PropTypes.string,
    isLoading: PropTypes.bool,
    needRefresh: PropTypes.bool,
    interpolate: PropTypes.bool,
    toggleInterpolate: PropTypes.func,
    error: PropTypes.bool
};

export default SensorChartV2