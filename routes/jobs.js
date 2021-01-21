"use strict";

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jsonschema = require ("jsonschema");
const jobSearchSchema = require("../schemas/jobSearch.json");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const router = new express.Router();

router.get("/", async (req, res, next) => {
    const filter = req.query;
    if (filter.minSalary) filter.minSalary = +filter.minSalary;
    filter.hasEquity = filter.hasEquity === "true";
    try {
        const validator = jsonschema.validate(filter, jobSearchSchema);
        if (!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const jobs = await Job.findAll(filter);
        return res.json({jobs});
    } catch(e) {
        return next(e);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const job = await Job.get(req.params.id);
        return res.json(job);
    } catch(e) {    
        return next(e);
    }
});

router.post("/", ensureAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.create(req.body);
        return res.status(201).json({job});
    } catch (e) {
        return next(e);
    }
});

router.patch("/:id", ensureAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }
        const job = await Job.update(req.params.id, req.body);
        return res.json({job});
    } catch(e) {
        return next(e);
    }
});

router.delete("/:id", ensureAdmin, async (req, res, next) => {
    try {
        await Job.remove(req.params.id);
        return res.json({deleted: +req.params.id});
    } catch(e) {
        return next(e);
    }
});

module.exports = router;