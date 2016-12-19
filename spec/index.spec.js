var proxyquire = require("proxyquire").noCallThru();

describe("index", () => {
  var testee;
  var pg;
  var courtbot;
  beforeEach(() => {
    pg = jasmine.createSpyObj("pg", ["connect"]);
    courtbot = jasmine.createSpyObj("courtbot", ["setRegistrationSource"]);
    courtbot.setRegistrationSource.and.callFake(fn => {
      testee = fn("test");
    });
    proxyquire("../index", {
      "pg": pg,
      "courtbot-engine": courtbot
    });
  });

  it("registers the required contract", () => {

    //registrations
    expect(testee.getRegistrationById).toBeDefined();
    expect(testee.getRegistrationsByPhone).toBeDefined();
    expect(testee.createRegistration).toBeDefined();
    expect(testee.updateRegistration).toBeDefined();

    //sent messages
    expect(testee.getSentMessage).toBeDefined();
    expect(testee.createSentMessage).toBeDefined();

  });

  describe("getRegistrationById", () => {
    it("connects to the database when passed an id", () => {
      testee.getRegistrationById(1);
      expect(pg.connect).toHaveBeenCalledWith("test", jasmine.any(Function));
    });

    describe("when the database connects", () => {
      var doneSpy = jasmine.createSpy("done");
      var clientSpy = jasmine.createSpyObj("client", ["query"]);
      beforeEach(() => {
        pg.connect.and.callFake((s, fn) => fn(undefined, clientSpy, doneSpy));
      })
      it("executes the sql query to retreive the rows", () => {
        testee.getRegistrationById(12);
        expect(doneSpy).not.toHaveBeenCalled();
        expect(clientSpy.query).toHaveBeenCalledWith("SELECT * FROM registrations WHERE registration_id = $1", [12], jasmine.any(Function));
      });

      describe("and the query finishes executing with no errors", () => {
        beforeEach(() => {
          clientSpy.query.and.callFake((q,p,fn) => fn(undefined, {rows: [1]}));
        });
        it("returns the data", cb => {
          testee.getRegistrationById(1234)
            .then(r => {
              expect(doneSpy).toHaveBeenCalled();
              expect(r).toEqual(1);
              cb();
            })
            .catch(err => {
              fail();
              cb();
            });
        });
      });

      describe("and the query finishes executing with errors", () => {
        beforeEach(() => {
          clientSpy.query.and.callFake((q,p,fn) => fn("wtf"));
        });
        it("fails with the error", cb => {
          testee.getRegistrationById(1234)
            .then(r => {
              fail();
              cb();
            })
            .catch(err => {
              expect(err).toEqual("wtf");
              cb();
            });
        });
      });
    });
  });

  describe("getRegistrationsByPhone", () => {
    it("connects to the database when passed a phone", () => {
      testee.getRegistrationsByPhone("1234567890");
      expect(pg.connect).toHaveBeenCalledWith("test", jasmine.any(Function));
    });

    describe("when the database connects", () => {
      var doneSpy = jasmine.createSpy("done");
      var clientSpy = jasmine.createSpyObj("client", ["query"]);
      beforeEach(() => {
        pg.connect.and.callFake((s, fn) => fn(undefined, clientSpy, doneSpy));
      })
      it("executes the sql query to retreive the rows", () => {
        testee.getRegistrationsByPhone("1234567890");
        expect(doneSpy).not.toHaveBeenCalled();
        expect(clientSpy.query).toHaveBeenCalledWith("SELECT * FROM registrations WHERE phone = $1", ["1234567890"], jasmine.any(Function));
      });

      describe("and the query finishes executing with no errors", () => {
        beforeEach(() => {
          clientSpy.query.and.callFake((q,p,fn) => fn(undefined, {rows: [1, 2, 3]}));
        });
        it("returns the data", cb => {
          testee.getRegistrationsByPhone("1234567890")
            .then(r => {
              expect(doneSpy).toHaveBeenCalled();
              expect(r).toEqual([1, 2, 3]);
              cb();
            })
            .catch(err => {
              fail();
              cb();
            });
        });
      });

      describe("and the query finishes executing with errors", () => {
        beforeEach(() => {
          clientSpy.query.and.callFake((q,p,fn) => fn("wtf"));
        });
        it("fails with the error", cb => {
          testee.getRegistrationsByPhone("1234567890")
            .then(r => {
              fail();
              cb();
            })
            .catch(err => {
              expect(err).toEqual("wtf");
              cb();
            });
        });
      });
    });
  });

});
