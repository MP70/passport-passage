const chai = require('chai');
const passport = require('passport-strategy');
const Passage = require('@passageidentity/passage-node');
const Strategy = require('../lib/strategy');

const expect = chai.expect;

describe('PassageStrategy', function() {

  describe('strategy', function() {
    let strategy;

    beforeEach(function() {
      strategy = new Strategy({
        appID: 'ABC123',
        apiKey: 'secret'
      }, function() {});
    });

    it('should be named passage', function() {
      expect(strategy.name).to.equal('passage');
    });

    it('should throw error when constructed without a verify callback', function() {
      expect(function() {
        new Strategy({
          appID: 'ABC123',
          apiKey: 'secret'
        });
      }).to.throw(TypeError, 'PassageStrategy requires a verify callback');
    });

    it('should throw error when constructed without appID option', function() {
      expect(function() {
        new Strategy({
          apiKey: 'secret'
        }, function() {});
      }).to.throw(TypeError, 'PassageStrategy requires an appID and apiKey option');
    });

    it('should throw error when constructed without apiKey option', function() {
      expect(function() {
        new Strategy({
          appID: 'ABC123'
        }, function() {});
      }).to.throw(TypeError, 'PassageStrategy requires an appID and apiKey option');
    });
  });

  describe('authenticate', function() {
    let strategy;

    beforeEach(function() {
      strategy = new Strategy({
        appID: 'ABC123',
        apiKey: 'secret'
      }, function() {});

      // mock Passage's authenticateRequest function
      strategy._passage.authenticateRequest = function(req) {
        return new Promise((resolve, reject) => {
          resolve('valid-user-id');
        });
      };

      // mock Passage's get user function
      strategy._passage.user.get = function(userID) {
        return new Promise((resolve, reject) => {
          resolve({
            id: userID,
            username: 'testUser',
            email: 'test@test.com'
          });
        });
      };
    });

    it('should error on invalid token', function(done) {
      // alter mock to simulate invalid token
      strategy._passage.authenticateRequest = function(req) {
        return new Promise((resolve, reject) => {
          resolve(null);
        });
      };

      chai.passport.use(strategy)
        .error(function(err) {
          done();
        })
        .req(function(req) {
          req.body = {};
        })
        .authenticate();
    });

    it('should fail on non-existing user', function(done) {
      // alter mock to simulate non-existing user
      strategy._passage.user.get = function(userID) {
        return new Promise((resolve, reject) => {
          resolve(null);
        });
      };

      chai.passport.use(strategy)
        .fail(function(info) {
          done();
        })
        .req(function(req) {
          req.body = {};
        })
        .authenticate();
    });

    it('should successfully authenticate a user', function(done) {
      chai.passport.use(strategy)
        .success(function(user, info) {
          expect(user.id).to.equal('valid-user-id');
          done();
        })
        .req(function(req) {
          req.body = {};
        })
        .authenticate();
    });
  });

});

