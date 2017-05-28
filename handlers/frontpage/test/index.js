'use strict';

const request 	= require('supertest');
const server    = require('../../../server.js');


describe('FRONTPAGE', () => {
    it('request => /', done => {
        request(server)
            .get('/')
            .expect('Content-Type', /text/)
            .expect(200)
            .end((err, res) => {
                if(err) {
                    throw err;
                } else {
                    done();
                }
            });
    });
});

