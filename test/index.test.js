import proxyquire from "proxyquire";
import setup from './setup';

describe("index", () => {
  const {sandbox, expect} = setup();

  let testee;
  let pg;
  let pgConnectStub;
  let cbSetRegistrationSourceStub;
  let courtbot;
  beforeEach(() => {
    pgConnectStub = sandbox.stub();
    pg = {
      connect: pgConnectStub
    };
    cbSetRegistrationSourceStub = sandbox.stub();
    courtbot = {
      setRegistrationSource: cbSetRegistrationSourceStub
    };
    proxyquire("../src/index", {
      "pg": pg,
      "courtbot-engine": courtbot
    });

    testee = cbSetRegistrationSourceStub.args[0][0]("test");
  });

  it("registers the required contract", () => {

    //registrations
    expect(testee.getRegistrationById).to.exist();
    expect(testee.getRegistrationsByPhone).to.exist();
    expect(testee.createRegistration).to.exist();

    //sent messages
    expect(testee.getSentMessage).to.exist();
    return expect(testee.createSentMessage).to.exist();
  });

  describe("getRegistrationById", () => {
    it("connects to the database when passed an id", () => {
      testee.getRegistrationById(1);
      return expect(pg.connect).to.have.been.calledWith("test", sandbox.match.func);
    });

    describe("when the database connects", () => {
      let doneSpy;
      let clientSpy;
      let clientQuerySpy;
      beforeEach(() => {
        doneSpy = sandbox.stub();
        clientSpy = sandbox.stub();
        clientQuerySpy = sandbox.stub();
        clientSpy.query = clientQuerySpy;
        pgConnectStub.callsArgWith(1, undefined, clientSpy, doneSpy);
      })
      it("executes the sql query to retreive the rows", () => {
        testee.getRegistrationById(12);
        expect(doneSpy).not.to.have.been.called();
        return expect(clientQuerySpy).to.have.been.calledWith("SELECT * FROM registrations WHERE registration_id = $1", [12], sandbox.match.func);
      });

      describe("and the query finishes executing with no errors", () => {
        beforeEach(() => {
          clientQuerySpy.callsArgWith(2, undefined, {rows: [1]});
        });
        it("returns the data", () => {
          return testee.getRegistrationById(1234)
            .then(r => {
              expect(doneSpy).to.have.been.called();
              expect(r).to.equal(1);
            })
        });
      });

      describe("and the query finishes executing with errors", () => {
        beforeEach(() => {
          clientQuerySpy.callsArgWith(2, "wtf");
        });
        it("fails with the error", () => {
          return testee.getRegistrationById(1234)
            .catch(err => err)
            .then(err => {
              expect(err).to.equal("wtf");
            });
        });
      });
    });
  });

  describe("getRegistrationsByPhone", () => {
    it("connects to the database when passed a phone", () => {
      testee.getRegistrationsByPhone("1234567890");
      expect(pg.connect).to.have.been.calledWith("test", sandbox.match.func);
    });

    describe("when the database connects", () => {
      let doneSpy;
      let clientSpy;
      let clientQuerySpy;
      beforeEach(() => {
        doneSpy = sandbox.stub();
        clientSpy = sandbox.stub();
        clientQuerySpy = sandbox.stub();
        clientSpy.query = clientQuerySpy;
        pgConnectStub.callsArgWith(1, undefined, clientSpy, doneSpy);
      });

      it("executes the sql query to retreive the rows", () => {
        testee.getRegistrationsByPhone("1234567890");
        expect(doneSpy).not.to.have.been.called();
        return expect(clientQuerySpy).to.have.been.calledWith("SELECT * FROM registrations WHERE phone = $1", ["1234567890"], sandbox.match.func);
      });

      describe("and the query finishes executing with no errors", () => {
        beforeEach(() => {
          clientQuerySpy.callsArgWith(2, undefined, {rows: [1, 2, 3]});
        });
        it("returns the data", () => {
          return testee.getRegistrationsByPhone("1234567890")
            .then(r => {
              expect(doneSpy).to.have.been.called();
              expect(r).to.eql([1, 2, 3]);
            });
        });
      });

      describe("and the query finishes executing with errors", () => {
        beforeEach(() => {
          clientQuerySpy.callsArgWith(2, "wtf");
        });
        it("fails with the error", () => {
          return testee.getRegistrationsByPhone("1234567890")
            .catch(err => err)
            .then(err => {
              expect(err).to.equal("wtf");
            });
        });
      });
    });
  });

});
