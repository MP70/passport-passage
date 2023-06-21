const chai = require("chai");
const chaiPassport = require("chai-passport-strategy");
const passport = require("passport-strategy");
const Passage = require("@passageidentity/passage-node");
const Strategy = require("../lib/strategy");

const expect = chai.expect;

chai.use(chaiPassport);

describe("PassageStrategy", function () {
  describe("strategy", function () {
    let strategy;

    beforeEach(function () {
      strategy = new Strategy(
        {
          appID: "ABC123",
          apiKey: "secret",
        },
        function () {}
      );
    });

    it("should be named passage", function () {
      expect(strategy.name).to.equal("passage");
    });

    it("should throw error when constructed without a verify callback", function () {
      expect(function () {
        new Strategy({
          appID: "ABC123",
          apiKey: "secret",
        });
      }).to.throw(TypeError, "PassageStrategy requires a verify callback");
    });

    it("should throw error when constructed without appID option", function () {
      expect(function () {
        new Strategy(
          {
            apiKey: "secret",
          },
          function () {}
        );
      }).to.throw(
        TypeError,
        "PassageStrategy requires an appID and apiKey option"
      );
    });

    it("should throw error when constructed without apiKey option", function () {
      expect(function () {
        new Strategy(
          {
            appID: "ABC123",
          },
          function () {}
        );
      }).to.throw(
        TypeError,
        "PassageStrategy requires an appID and apiKey option"
      );
    });
  });

  describe("authenticate", function () {
    let strategy;

    beforeEach(function () {
      strategy = new Strategy(
        {
          appID: "ABC123",
          apiKey: "secret",
        },
        function () {}
      );

      // mock Passage's authenticateRequest function
      strategy._passage.authenticateRequest = function (req) {
        return new Promise((resolve, reject) => {
          resolve("valid-user-id");
        });
      };

      // mock Passage's get user function
      strategy._passage.user.get = function (userID) {
        return new Promise((resolve, reject) => {
          resolve({
            id: userID,
            username: "testUser",
            email: "test@test.com",
          });
        });
      };
    });

    it("should error on invalid token", async function () {
      // alter mock to simulate invalid token
      strategy._passage.authenticateRequest = function (req) {
        return new Promise((resolve, reject) => {
          resolve(null);
        });
      };

      try {
        await chai.passport.use(strategy).authenticate();

        throw new Error("Test should have thrown an error");
      } catch (err) {
        expect(err).to.exist;
      }
    });

    it("should fail on non-existing user", async function () {
      // alter mock to simulate non-existing user
      strategy._passage.user.get = function (userID) {
        return new Promise((resolve, reject) => {
          resolve(null);
        });
      };

      try {
        await chai.passport.use(strategy).authenticate();

        throw new Error("Test should have thrown an error");
      } catch (err) {
        expect(err).to.exist;
      }
    });

    it("should successfully authenticate a user", async function () {
      try {
        const result = await new Promise((resolve, reject) => {
          chai.passport
            .use(strategy)
            .success(function (user, info) {
              resolve({ user, info });
            })
            .authenticate();
        });

        expect(result).to.be.an("object");
        expect(result.user).to.exist;
        expect(result.user.id).to.equal("valid-user-id");
      } catch (err) {
        throw err;
      }
    });
  });
});
