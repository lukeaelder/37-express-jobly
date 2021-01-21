"use strict";

const request = require("supertest");
const app = require("../app");
const testCommon = require("./_testCommon");
const {testJobId, u1Token, adminToken} = require("./_testCommon");
beforeAll(testCommon.commonBeforeAll);
beforeEach(testCommon.commonBeforeEach);
afterEach(testCommon.commonAfterEach);
afterAll(testCommon.commonAfterAll);

describe("GET /jobs", () => {
    test("works with no filters", async () => {
        const response = await request(app).get("/jobs");
        expect(response.body).toEqual(
            {jobs: [
                {
                    id: expect.any(Number),
                    title: "testjob1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1"
                },
                {
                    id: expect.any(Number),
                    title: "testjob2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c2",
                    companyName: "C2"
                },
                {
                    id: expect.any(Number),
                    title: "testjob3",
                    salary: 3,
                    equity: null,
                    companyHandle: "c3",
                    companyName: "C3"
                }
            ]}
        );
    });
    test("works with name filter", async () => {
        const response = await request(app).get("/jobs").query({title:"testjob2"});
        expect(response.body).toEqual({
            jobs: [
                {
                    id: expect.any(Number),
                    title: "testjob2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c2",
                    companyName: "C2"
                }
            ]}
        );
    });
    test("works with min salary filter", async () => {
        const response = await request(app).get("/jobs").query({minSalary:2});
        expect(response.body).toEqual(
            {jobs: [
                {
                    id: expect.any(Number),
                    title: "testjob2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c2",
                    companyName: "C2"
                },
                {
                    id: expect.any(Number),
                    title: "testjob3",
                    salary: 3,
                    equity: null,
                    companyHandle: "c3",
                    companyName: "C3"
                }
            ]}
        );
    });
    test("works with equity filter", async () => {
        const response = await request(app).get("/jobs").query({hasEquity:true});
        expect(response.body).toEqual(
            {jobs:[
                {
                    id: expect.any(Number),
                    title: "testjob1",
                    salary: 1,
                    equity: "0.1",
                    companyHandle: "c1",
                    companyName: "C1"
                },
                {
                    id: expect.any(Number),
                    title: "testjob2",
                    salary: 2,
                    equity: "0.2",
                    companyHandle: "c2",
                    companyName: "C2"
                }
            ]}
        );
    });
    test("fails with invalid filter", async () => {
        const response = await request(app).get("/jobs").query({notafilter:"no"});
        expect(response.statusCode).toEqual(400);
    });
});

describe("Create", () => {
    test("works creating a new job", async () => {
        const response = await request(app).post("/jobs").send({
            title: "newjob",
            salary: 5,
            equity: "0.5",
            companyHandle: "c1"
        }).set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "newjob",
                salary: 5,
                equity: "0.5",
                companyHandle: "c1",
            }   
        });
    });
    test("fails if unauthorized", async () => {
        const response = await request(app).post("/jobs").send({
            title: "newjob",
            salary: 5,
            equity: "0.5",
            companyHandle: "c1"
        }).set("authorization", `Bearer ${u1Token}`);
        expect(response.statusCode).toEqual(401);
    });
    test("fails if invalid data", async () => {
        const response = await request(app).post("/jobs").send({
            title: 9,
            salary: "notanumber",
            equity: 22,
            companyHandle: "c1"
        }).set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(400);
    });
    test("fails if missing data", async () => {
        const response = await request(app).post("/jobs").send({
            equity: "0.1",
            companyHandle: "c1"
        }).set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(400);
    });
});

describe("Get", () => {
    test("works getting a job", async () => {
        const response = await request(app).get(`/jobs/${testJobId[0]}`);
        expect(response.body).toEqual({
            id: expect.any(Number),
            title: "testjob1",
            salary: 1,
            equity: "0.1",
            company: {
                handle: "c1",
                name: "C1",
                description: "Desc1",
                numEmployees: 1,
                logoUrl: "http://c1.img"
            }
        });
    });
    test("fails if job is not found", async () => {
        const response = await request(app).get("/jobs/0");
        expect(response.statusCode).toEqual(404);
    });
});

describe("Update", () => {
    test("works updating a job", async () => {
        const response = await request(app).patch(`/jobs/${testJobId[0]}`).send({
            title: "updatedjob",
        }).set("authorization", `Bearer ${adminToken}`);
        expect(response.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "updatedjob",
                salary: 1,
                equity: "0.1",
                companyHandle: "c1",
            }   
        });
    });
    test("fails if unauthorized", async () => {
        const response = await request(app).patch(`/jobs/${testJobId[0]}`).send({
            title: "updatedjob",
        }).set("authorization", `Bearer ${u1Token}`);
        expect(response.statusCode).toEqual(401);
    });
    test("fails if job is not found", async () => {
        const response = await request(app).patch(`/jobs/0`).send({
            title: "updatedjob",
        }).set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(404);
    });
    test("fails if invalid data", async () => {
        const response = await request(app).patch(`/jobs/${testJobId[0]}`).send({
            salary: "no"
        }).set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(400);
    });
});

describe("Remove", () => {
    test("works removing job", async () => {
        const response = await request(app).delete(`/jobs/${testJobId[0]}`).set("authorization", `Bearer ${adminToken}`);
        expect(response.body).toEqual({deleted: testJobId[0]});
    });
    test("fails if unathorized", async () => {
        const response = await request(app).delete(`/jobs/${testJobId[0]}`).set("authorization", `Bearer ${u1Token}`);
        expect(response.statusCode).toEqual(401);
    });
    test("fails if job is not found", async () => {
        const response = await request(app).delete(`/jobs/0`).set("authorization", `Bearer ${adminToken}`);
        expect(response.statusCode).toEqual(404);
    });
});