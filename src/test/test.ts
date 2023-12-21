import chai from "chai";
import chaiHttp from "chai-http";
import { describe } from "mocha";
import { app } from "../index";
import { swaggerDefinition } from "../swagger/swaggerDoc";
import validateSwagger from "./util/validateSwagger";

chai.use(chaiHttp);
chai.should();

describe("Endpoints", () => {
    describe("Status", () => {
        describe("GET /api/status", () => {
            let response: ChaiHttp.Response;

            before((done) => {
                chai.request(app)
                    .get("/api/status")
                    .end((err, res) => {
                        response = res;
                        done();
                    });
            });

            it("should be OK", (done) => {
                response.should.have.status(200);
                response.body.should.have.property("status").eql(200);
                response.body.should.have.property("data").eql("OK");
                done();
            });
            it("should match response type of swagger docs", (done) => {
                validateSwagger(
                    swaggerDefinition.paths["/status"].get.responses["200"]
                        .content["application/json"].schema,
                    response.body,
                );
                done();
            });
        });
    });

    describe("Institution", () => {
        describe("GET /api/institutions", () => {
            let response: ChaiHttp.Response;

            before((done) => {
                chai.request(app)
                    .get("/api/institutions")
                    .end((err, res) => {
                        response = res;
                        done();
                    });
            });

            it("should be 200", (done) => {
                response.should.have.status(200);
                response.body.should.have.property("status").eql(200);
                response.body.should.have.property("data");
                done();
            });

            it("should match response type of swagger docs", (done) => {
                validateSwagger(
                    swaggerDefinition.paths["/institutions"].get.responses[
                        "200"
                    ].content["application/json"].schema,
                    response.body,
                );
                done();
            });
        });
    });

    describe.skip("Courses", () => {
        describe("GET /api/courses", () => {
            let responseValid: ChaiHttp.Response;
            let responseInvalid: ChaiHttp.Response;

            before((done) => {
                chai.request(app)
                    .get("/api/courses?institution=UCI")
                    .end((err, res) => {
                        responseValid = res;
                        done();
                    });
                chai.request(app)
                    .get("/api/courses?this-is-invalid=true")
                    .end((err, res) => {
                        responseInvalid = res;
                        done();
                    });
            });

            it("should be 200", (done) => {
                responseValid.should.have.status(200);
                responseValid.body.should.have.property("status").eql(200);
                responseValid.body.should.have.property("data");
                done();
            });

            it("should match response type of swagger docs", (done) => {
                validateSwagger(
                    swaggerDefinition.paths["/courses"].get.responses["200"]
                        .content["application/json"].schema,
                    responseValid.body,
                );
                done();
            });

            it("should be 400 for invalid parameters", (done) => {
                responseInvalid.should.have.status(400);
                responseInvalid.body.should.have.property("status").eql(400);
                responseInvalid.body.should.have.property("error");
                done();
            });
        });
    });
});
