import chai from "chai";
import chaiHttp from "chai-http";
import { describe } from "mocha";

import { app } from "../index";
import { coursesByInstitutionResponseSchema } from "../model/course-model";
import {
    cvcCoursesResponseSchema,
    cvcLastUpdatedResponseSchema,
} from "../model/cvc-model";
import { institutionsResponseSchema } from "../model/institution-model";
import { swaggerDefinition } from "../swagger/swagger-doc";

import validateSwagger from "./util/validate-swagger";

chai.use(chaiHttp);
chai.should();

describe("Database", () => {});

describe("Endpoints", () => {
    describe("Status", () => {
        describe("GET /api/status", () => {
            let response: ChaiHttp.Response;

            before((done) => {
                chai.request(app)
                    .get("/api/status")
                    .end((_err, res) => {
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

    describe("Institutions", () => {
        describe("GET /api/institutions", () => {
            let response: ChaiHttp.Response;

            before((done) => {
                chai.request(app)
                    .get("/api/institutions")
                    .end((_err, res) => {
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

            it("should have non-empty data", (done) => {
                response.body.data.should.not.be.empty;
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

            it("should match response type in .model", (done) => {
                institutionsResponseSchema.parse(response.body);
                done();
            });
        });
    });

    describe("Courses", () => {
        describe("GET /api/courses", () => {
            describe("Valid", () => {
                let response: ChaiHttp.Response;

                before((done) => {
                    chai.request(app)
                        .get("/api/courses")
                        .query({ institution: "UCI", take: "1" })
                        .end((_err, res) => {
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

                it("should have non-empty data", (done) => {
                    response.body.data.should.not.be.empty;
                    done();
                });

                it("should match response type of swagger docs", (done) => {
                    validateSwagger(
                        swaggerDefinition.paths["/courses"].get.responses["200"]
                            .content["application/json"].schema,
                        response.body,
                    );
                    done();
                });
                it("should match response type in .model", (done) => {
                    coursesByInstitutionResponseSchema.parse(response.body);
                    done();
                });
            });
            describe("Invalid", () => {
                let response: ChaiHttp.Response;

                before((done) => {
                    chai.request(app)
                        .get("/api/courses")
                        .query({ _invalid: "invalid" })
                        .end((_err, res) => {
                            response = res;
                            done();
                        });
                });

                it("should be 400", (done) => {
                    response.should.have.status(400);
                    response.body.should.have.property("status").eql(400);
                    response.body.should.have.property("error");
                    done();
                });

                it("should match response type of swagger docs", (done) => {
                    validateSwagger(
                        swaggerDefinition.paths["/courses"].get.responses["400"]
                            .content["application/json"].schema,
                        response.body,
                    );
                    done();
                });
            });
        });
    });
    describe("CVC Courses", () => {
        describe("GET /api/cvc-courses", () => {
            describe("Valid", () => {
                let response: ChaiHttp.Response;

                before((done) => {
                    chai.request(app)
                        .get("/api/cvc-courses")
                        .query({ institution: "UCI", ge: "III", take: "1" })
                        .end((_err, res) => {
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

                it("should have non-empty data", (done) => {
                    response.body.data.should.not.be.empty;
                    done();
                });

                it("should match response type of swagger docs", (done) => {
                    validateSwagger(
                        swaggerDefinition.paths["/cvc-courses"].get.responses[
                            "200"
                        ].content["application/json"].schema,
                        response.body,
                    );
                    done();
                });
                it("should match response type in .model", (done) => {
                    cvcCoursesResponseSchema.parse(response.body);
                    done();
                });
            });
            describe("Invalid", () => {
                let response: ChaiHttp.Response;

                before((done) => {
                    chai.request(app)
                        .get("/api/cvc-courses")
                        .query({ _invalid: "invalid" })
                        .end((_err, res) => {
                            response = res;
                            done();
                        });
                });

                it("should be 400", (done) => {
                    response.should.have.status(400);
                    response.body.should.have.property("status").eql(400);
                    response.body.should.have.property("error");
                    done();
                });

                it("should match response type of swagger docs", (done) => {
                    validateSwagger(
                        swaggerDefinition.paths["/cvc-courses"].get.responses[
                            "400"
                        ].content["application/json"].schema,
                        response.body,
                    );
                    done();
                });
            });
        });
        describe("GET /api/cvc-courses/course", () => {
            describe("Valid", () => {
                let response: ChaiHttp.Response;

                before((done) => {
                    chai.request(app)
                        .get("/api/cvc-courses/course")
                        .query({
                            institution: "UCI",
                            courseCode: "ANTHRO2A",
                            take: "1",
                        })
                        .end((_err, res) => {
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

                it("should have non-empty data", (done) => {
                    response.body.data.should.not.be.empty;
                    done();
                });

                it("should match response type of swagger docs", (done) => {
                    validateSwagger(
                        swaggerDefinition.paths["/cvc-courses/course"].get
                            .responses["200"].content["application/json"]
                            .schema,
                        response.body,
                    );
                    done();
                });
                it("should match response type in .model", (done) => {
                    cvcCoursesResponseSchema.parse(response.body);
                    done();
                });
            });
            describe("Invalid", () => {
                let response: ChaiHttp.Response;

                before((done) => {
                    chai.request(app)
                        .get("/api/cvc-courses/course")
                        .query({ _invalid: "invalid" })
                        .end((_err, res) => {
                            response = res;
                            done();
                        });
                });

                it("should be 400", (done) => {
                    response.should.have.status(400);
                    response.body.should.have.property("status").eql(400);
                    response.body.should.have.property("error");
                    done();
                });

                it("should match response type of swagger docs", (done) => {
                    validateSwagger(
                        swaggerDefinition.paths["/cvc-courses/course"].get
                            .responses["400"].content["application/json"]
                            .schema,
                        response.body,
                    );
                    done();
                });
            });
        });
        describe("GET /api/cvc-courses/last-updated", () => {
            describe("Valid", () => {
                let response: ChaiHttp.Response;

                before((done) => {
                    chai.request(app)
                        .get("/api/cvc-courses/last-updated")
                        .end((_err, res) => {
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
                        swaggerDefinition.paths["/cvc-courses/last-updated"].get
                            .responses["200"].content["application/json"]
                            .schema,
                        response.body,
                    );
                    done();
                });

                it("should match response type in .model", (done) => {
                    cvcLastUpdatedResponseSchema.parse(response.body);
                    done();
                });
            });
        });
    });
});
