import chai from "chai";
import chaiHttp from "chai-http";
import { app } from "../index";

chai.use(chaiHttp);
chai.should();

describe("Status", () => {
    describe("GET /api/status", () => {
        it("should be OK", (done) => {
            chai.request(app)
                .get("/api/status")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("status").eql(200);
                    res.body.should.have.property("data").eql("OK");
                    done();
                });
        });
    });
});
