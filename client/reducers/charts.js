'use strict';

import * as AT from '../actions/constants';

const init = {
    isLoading: false,
    error: false,
    errors: {},
    charts: [],
    sync: false,
    selectedProject: null,
    selectedDevice: null,
    viewMode: 'auto',
    dateStart: new Date(),
    dateEnd: new Date(),
    timeStart: new Date((new Date()).setHours(0, 0, 0)),
    timeEnd: new Date((new Date()).setHours(23, 59, 59)),
    realtime: false,
    dataSource: 'changelog'
    // projects: {}
};
function guid () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

export default function (state = init, action) {
    const { type, data, payload, ...rest } = action;

    let nextState;
    let nextCharts;

    switch(type) {
        default: return state;

        case AT.CHART + AT._SYNC:
            return Object.assign({}, state, {
                sync: !state.sync
            });
            break;

        case AT.CHART + AT.DATA + AT._UPDATE:
            let chartsDataMap = {};

            for (let i = 0, l = data.length; i < l; i++) {
                // chartsDataMap[data[i].chartId] = data[i].data;
                for (let ii = 0, ll = state.charts.length; ii < ll; ii++) {
                    if (state.charts[ii]._id == data[i].chartId) {
                        delete state.charts[ii].data;
                        state.charts[ii].data = data[i].data;
                    }
                }
            }

            /*let newCharts = state.charts.map(chart => {
                if (chartsDataMap[chart._id]) chart.data = chartsDataMap[chart._id];

                return chart;
            });*/

            return Object.assign({}, state/*, { charts: newCharts }*/);

        case AT.CHART + AT.SENSOR + AT._SELECT:
            nextState = Object.assign({}, state);

            for (let i = 0, l = nextState.charts.length; i < l; i++) {
                let chart = nextState.charts[i];

                if (chart._id == data.chartId) {
                    chart.selectedSensorsId = data.sensorsId;
                    break;
                }
            }

            return nextState;
            break;

        case AT.CHART + AT._CREATE:
            let charts = state.charts.map(chart => chart);
                charts.push({
                    _id: guid(),
                    selectedSensorsId: [],
                    data: [],
                    interpolate: false,
                    needRefresh: true,
                    isLoading: false, //#!
                    error: false
                });
            return Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                charts: charts
            });
            break;

        case AT.CHART + AT._DELETE:
            nextCharts = state.charts.map(c => Object.assign({}, c));
            let removeIndex;
            nextCharts.forEach((c, i) => {
                if (data.chartId == c._id) {
                    removeIndex = i;
                    c.data = [];
                }
            });

            if (undefined === removeIndex) return state;

            nextCharts.splice(removeIndex, 1);

            return Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                charts: nextCharts
            });
            break;

        case AT.CHANGELOG + AT._READ:
            nextCharts = state.charts.map(c => {
                if (data.chartId == c._id) {
                    c.isLoading = true;
                    c.error = false;
                    c.data = [];
                }
                return c;
            });

            return Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                charts: nextCharts
            });
            break;

        case AT.CHANGELOG + AT._READ + AT._SUCCESS:
            nextCharts = state.charts.map(c => {
                if (data.chartId == c._id) {
                    c.isLoading = false;
                    c.needRefresh = false;
                    c.error = false;
                    c.data = payload;
                }
                return c;
            });
            return Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                charts: nextCharts
            });
            break;

        case AT.CHANGELOG + AT._READ + + AT._ERROR:
            nextCharts = state.charts.map(c => {
                if (data.chartId == c._id) {
                    c.isLoading = false;
                    c.error = true;
                }
                return c;
            });

            return Object.assign({}, state, {
                isLoading: false,
                error: false,
                errors: {},
                charts: nextCharts
            });

            break;


        case AT.CHART + AT.DEVICE + AT._SELECT:
            if (data.projectId == state.selectedProject && data.deviceId == state.selectedDevice) return state;
            return Object.assign({}, state, {
                selectedProject: data.projectId,
                selectedDevice: data.deviceId,
                sensors: data.sensors,
                charts: []
            });

            break;

        case AT.CHART + AT.VIEWMODE + AT._CHANGE:
            return Object.assign({}, state, {
                viewMode: data.mode
            });

            break;


        case AT.CHART + AT._CHANGE:
            nextState = Object.assign({}, state);

            if ('realtime' in data) {
                nextState.realtime = data.realtime;

            }

            nextState.charts.forEach(chart => {
                if (data.realtime) chart.data = [];
                if (chart.selectedSensorsId.length && !nextState.realtime) {
                    chart.needRefresh = true;
                } else {
                    chart.needRefresh = false;
                }
            });

            if (data.dataSource) nextState.dataSource = data.dataSource;
            if (data.dateStart) nextState.dateStart = data.dateStart;
            if (data.dateEnd) nextState.dateEnde = data.dateEnd;
            if (data.timeStart) nextState.timeStart = data.timeStart;
            if (data.timeEnd) nextState.timeEnd = data.timeEnd;



            return nextState;

            break;

        case AT.CHART + AT.INTERPOLATE + AT._CHANGE:
            nextState = Object.assign({}, state);

            for (let i = 0, l = nextState.charts.length; i < l; i++) {
                if (nextState.charts[i]._id == data.chartId) {
                    nextState.charts[i].interpolate = !nextState.charts[i].interpolate;
                    break;
                }
            }

            return nextState;



        //     type: CHART + DEVICE + _SELECT,
        //         data: {
        //     projectId: opts.projectId,
        //         device: opts.deviceId
        // }

    }
}