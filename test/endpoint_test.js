// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-example-access-control
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

/* jshint camelcase: false */
var app = require('../slock_it');
var request = require('supertest');
var assert = require('assert');

function json(verb, url) {
    return request(app)[verb](url)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/);
}

describe('REST API request', function() {
    before(function(done) {
        require('./start-server');
        done();
    });

    after(function(done) {
        app.removeAllListeners('started');
        app.removeAllListeners('loaded');
        done();
    });

    it('should obtain ens events ', function(done) {
        this.timeout(6000);
        json('get', '/ens')
            .expect(200, (err, res) => {
		assert(Array.isArray(res.body));
                done();
            });
    });



});
