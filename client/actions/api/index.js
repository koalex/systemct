'use strict';


export function signin (credentials, socket) {
    let body = {
        email: 'test'/*credentials.email*/,
        password: 'test123'/*credentials.password*/
    };

    if (socket && socket.connected) {
        socket.emit('signin', body);
        return;
    }

    return fetch('/signin', {
        method: 'post',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: Object.keys(body).map(key => key + '=' + body[key]).join('&')
    })
}