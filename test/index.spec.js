import setup from './setup';
var proxyquire = require("proxyquire").noCallThru();

const jasmine = {
    any: () => {}
};

describe("index", () => {
  const {sandbox, expect} = setup();
  let testee, pg, courtbot, doneSpy, clientSpy;

  beforeEach(() => {
    doneSpy = sandbox.stub();
    clientSpy = {query: sandbox.stub()};
    pg = {connect: sandbox.spy((s, fn) => fn(undefined, clientSpy, doneSpy))};

    courtbot = {setRegistrationSource: sandbox.spy(fn=>testee = fn("test"))};

    proxyquire("../index", {
      "pg": pg,
      "courtbot-engine": courtbot
    });
  });

  it("registers the required contract", () => {

    //registrations
    expect(testee.getRegistrationById).to.exist();
    expect(testee.getRegistrationsByPhone).to.exist();
    expect(testee.createRegistration).to.exist();
    expect(testee.updateRegistrationName).to.exist();
    expect(testee.updateRegistrationState).to.exist();

    //sent messages
    expect(testee.getSentMessage).to.exist();
    expect(testee.createSentMessage).to.exist();

  });

  describe("getRegistrationById", () => {
    it("connects to the database when passed an id", () => {
      testee.getRegistrationById(1);
      expect(pg.connect).to.have.been.calledWith("test");
    });

    describe("when the database connects", () => {
      it("executes the sql query to retreive the rows", () => {
        testee.getRegistrationById(12);
        expect(doneSpy).not.to.have.been.called();
        expect(clientSpy.query).to.have.been.calledWith("SELECT * FROM registrations WHERE registration_id = $1", [12]);
      });

      describe("and the query finishes executing with no errors", () => {
        beforeEach(() => {
          clientSpy.query = sandbox.spy((q,p,fn) => fn(undefined, {rows: [1]}));
        });
        it("returns the data", function() {
          return testee.getRegistrationById(1234)
            .then(r => {
              expect(doneSpy).to.have.been.called();
              expect(r).to.eql(1);
            });
        });
      });

      describe("and the query finishes executing with errors", () => {
        beforeEach(() => {
          clientSpy.query = sandbox.spy((q,p,fn) => fn("wtf"));
        });
        it("fails with the error", () => {
          return testee.getRegistrationById(1234)
            .then(() => Promise.reject("Promise should have rejected."))
            .catch(err => expect(err).to.eql("wtf"));
        });
      });
    });
  });

  describe("getRegistrationsByPhone", () => {
    it("connects to the database when passed a phone", () => {
      testee.getRegistrationsByPhone("1234567890");
      expect(pg.connect).to.have.been.calledWith("test");
    });

    describe("when the database connects", () => {

      it("executes the sql query to retreive the rows", () => {
        testee.getRegistrationsByPhone("1234567890");
        expect(doneSpy).not.to.have.been.called();
        expect(clientSpy.query).to.have.been.calledWith("SELECT * FROM registrations WHERE phone = $1", ["1234567890"]);
      });

      describe("and the query finishes executing with no errors", () => {
        beforeEach(() => {
          clientSpy.query = sandbox.spy((q,p,fn) => fn(undefined, {rows: [1, 2, 3]}));
        });
        it("returns the data", () => {
          return testee.getRegistrationsByPhone("1234567890")
            .then((r) => {
              expect(doneSpy).to.have.been.called();
              expect(r).to.eql([1, 2, 3]);
            });
        });
      });

      describe("and the query finishes executing with errors", () => {
        beforeEach(() => {
          clientSpy.query = sandbox.spy((q,p,fn) => fn("wtf"));
        });
        it("fails with the error", () => {
          return testee.getRegistrationsByPhone("1234567890")
            .then(()=>Promise.reject("Promise should have rejected"))
            .catch(err => expect(err).to.eql("wtf"))
        });
      });
    });
  });

});
