'use strict';

import { AUTH, _CHECK, _SUCCESS, _ERROR  } from '../actions/constants';
import FileSaver from 'file-saver';

export default store => next => async action => {
    const { CALL_API, type, ...rest } = action;

    if (!CALL_API) return next(action);

    next({ ...rest, type: type });

    const request = {
        method: CALL_API.method,
        mode: 'same-origin',
        cache: 'no-cache',
        headers: Object.assign({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-access-token': window.localStorage.getItem('access_token')
        }, (CALL_API.headers || {}))
    };


    if (CALL_API.method.toUpperCase() !== 'GET' && CALL_API.method.toUpperCase() !== 'HEAD') {
        if (request.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            request.body = (CALL_API.body || Object.keys(rest.data).map(key => key + '=' + rest.data[key]).join('&'))
        } else if (request.headers['Content-Type'] && ~request.headers['Content-Type'].indexOf('multipart/form-data')) {

            let formData  = new FormData();

            for (let v in rest.data.body) {
                if (rest.data.body[v] || typeof rest.data.body[v] === 'string') {

                    if (Array.isArray(rest.data.body[v])) {
                        rest.data.body[v].forEach((arrElem, i) => {
                            formData.append(v + i, arrElem);
                        })
                    } else {
                        formData.append(v, rest.data.body[v]);
                    }

                }
            }

            delete request.headers['Content-Type']; // browser add Content-Type and boundary

            request.body = formData;

        } else {
            request.body = CALL_API.body ? JSON.stringify(CALL_API.body) : JSON.stringify(rest.data || undefined)
        }
    }
    let response = await fetch(CALL_API.endpoint, request);

    if (response.status == 204 && !rest.skipSuccess) return next({ type: type + _SUCCESS, ...rest });

    let payload;

    let contentType = response.headers.get('Content-Type');

    if (contentType && ~contentType.indexOf('json')) {
        payload = await response.json();
    } else if (contentType && ~contentType.indexOf('gzip')) {
        payload = await response.blob();

        FileSaver.saveAs(payload, rest.filename ? rest.filename: null);
    } else {
        payload = await response.text();
    }

    if (response.status == 401) return next({ type: AUTH + _CHECK + _ERROR, payload, ...rest });
    if (response.status >= 400) return next({ type: type + _ERROR, payload, ...rest });


    if (!rest.skipSuccess) next({ type: type + _SUCCESS, payload, ...rest });
}