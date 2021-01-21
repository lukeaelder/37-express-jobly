"use strict";

const db = require("../db.js");
const Job = require("./job.js");
const testCommon = require("./_testCommon");
const { NotFoundError, BadRequestError } = require("../expressError");
const {testJobId} = require("./_testCommon")
beforeAll(testCommon.commonBeforeAll);
beforeEach(testCommon.commonBeforeEach);
afterEach(testCommon.commonAfterEach);
afterAll(testCommon.commonAfterAll);

describe("Get all", () => {
    test("works with no filters", async () => {
        const result = await Job.findAll();
        expect(result).toEqual([
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
        ]);
    });
    test("works with name filter", async () => {
        const result = await Job.findAll({title:"testjob2"});
        expect(result).toEqual([
            {
                id: expect.any(Number),
                title: "testjob2",
                salary: 2,
                equity: "0.2",
                companyHandle: "c2",
                companyName: "C2"
            }
        ]);
    });
    test("works with min salary filter", async () => {
        const result = await Job.findAll({minSalary:2});
        expect(result).toEqual([
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
        ]);
    });
    test("works with equity filter", async () => {
        const result = await Job.findAll({hasEquity:true});
        expect(result).toEqual([
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
        ]);
    });
    test("fails with invalid filter", async () => {
        try {
            await Job.findAll({notafilter:"no"});
        } catch(e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});

describe("Create", () => {
    const newJob = {
        title: "newjob",
        salary: 10,
        equity: null,
        companyHandle: "c1"
    }
    test("works creating a new job", async () => {
        const result = await Job.create(newJob);
        expect(result).toEqual({
            id: expect.any(Number),
            title: "newjob",
            salary: 10,
            equity: null,
            companyHandle: "c1",
        });
    });
});

describe("Get", () => {
    test("works getting a job", async () => {
        const result = await Job.get(testJobId[0]);
        expect(result).toEqual({
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
        try {
            await Job.get(0);
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});

describe("Update", () => {
    const updateJob = {
        title: "updatedJob",
        salary: 100,
        equity: "0.4"
    };
    test("works updating a job", async () => {
        const result = await Job.update(testJobId[0], updateJob);
        expect(result).toEqual({
            id: testJobId[0],
            title: "updatedJob",
            salary: 100,
            equity: "0.4",
            companyHandle: "c1"
        });
    });
    test("fails if job is not found", async () => {
        try {
            await Job.update(0, updateJob);
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
    test("fails if no data is provided", async () => {
        try {
            await Job.update(testJobId[0]);
        } catch (e) {
            expect(e instanceof BadRequestError).toBeTruthy();
        }
    });
});

describe("Remove", () => {
    test("works removing job", async () => {
        await Job.remove(testJobId[0]);
        const result = await db.query(`SELECT * FROM jobs WHERE id=$1`, [testJobId[0]]);
        expect(result.rows.length).toEqual(0);
    });
    test("fails if job is not found", async () => {
        try {
            await Job.remove(0);
        } catch (e) {
            expect(e instanceof NotFoundError).toBeTruthy();
        }
    });
});