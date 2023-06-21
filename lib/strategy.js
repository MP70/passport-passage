const util = require('util');
const passport = require('passport-strategy');
const Passage = require('@passageidentity/passage-node');
const parse = require('./profile');

/**
 * `PassageStrategy` constructor.
 * The Passage authentication strategy authenticates requests by using Passage's SDK.
 *
 * @param {Object} options - Strategy options.
 * @param {String} options.appID - Your Passage Application ID.
 * @param {String} options.apiKey - Your Passage Application Secret Key.
 * @param {Function} verify - Passport verify callback.
 * @throws {TypeError} If the `verify` callback is not provided.
 * @throws {TypeError} If the `appID` or `apiKey` option is not provided.
 * @constructor
 * @public
 */
function Strategy(options, verify) {
    if (typeof options === 'function') {
        verify = options;
        options = undefined;
    }
    options = options || {};

    if (!verify) throw new TypeError('PassageStrategy requires a verify callback');

    if (!options.appID || !options.apiKey) {
        throw new TypeError('PassageStrategy requires an appID and apiKey option');
    }

    passport.Strategy.call(this);
    this.name = 'passage';
    this._verify = verify;
    this._passage = new Passage(options);
}

// Inherit from `passport.Strategy`.
util.inherits(Strategy, passport.Strategy);

/**
 * Retrieves the profile of the user with the given `userID`.
 *
 * @param {String} userID - The ID of the user.
 * @param {Function} done - Callback function.
 * @public
 */
Strategy.prototype.userProfile = function(userID, done) {
    this._passage.user.get(userID)
        .then(passageUser => {
            if (!passageUser) {
                return done(new Error("User not found"));
            }

            const profile = parse(passageUser);
            done(null, profile);
        })
        .catch(err => done(err));
};

/**
 * Authenticate request based on the validity of the authToken.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} [options] - Optional options.
 * @public
 */
Strategy.prototype.authenticate = function(req, options) {
    options = options || {};

    this._passage.authenticateRequest(req)
        .then((userID) => {
            if (!userID) return this.fail({ message: 'Invalid auth token' }, 401);

            this.userProfile(userID, (err, profile) => {
                if (err) { return this.error(err); }

                this._verify(req, userID, profile, (err, user, info) => {
                    if (err) { return this.error(err); }
                    if (!user) { return this.fail(info); }
                    this.success(user, info);
                });
            });
        })
        .catch(err => this.error(err));
};

module.exports = Strategy;

