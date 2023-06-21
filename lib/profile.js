/**
 * Parse user profile.
 *
 * @param {Object} user - The user object received from Passage's API.
 * @returns {Object} The user profile in a Passport-compatible format.
 * @public
 */
function parse(user) {
  // The user object returned from Passage might look like this:
  // {
  //     id: '123456',
  //     email: 'user@example.com',
  //     phone: '+15005550006',
  //     user_metadata: {
  //         firstName: 'John',
  //         lastName: 'Doe',
  //         ...
  //     },
  //     ...
  // }
  //
  // Passport expects the user profile to be in the following format:
  // http://www.passportjs.org/docs/profile/
  //
  // Let's transform the Passage user object into a Passport-compatible profile.

  var profile = {};

  profile.id = user.id;
  profile.displayName =
    user.user_metadata.firstName + " " + user.user_metadata.lastName;
  profile.name = {
    familyName: user.user_metadata.lastName,
    givenName: user.user_metadata.firstName,
  };
  profile.emails = [{ value: user.email }];
  profile.phoneNumbers = [{ value: user.phone }];

  return profile;
}

module.exports = parse;
