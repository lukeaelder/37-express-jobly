"user strict";

const db = require("../db");
const { NotFoundError, BadRequestError} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
    static async create(data){
        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4) 
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`, 
            [data.title, data.salary, data.equity, data.companyHandle]);
        return result.rows[0];
    }

    static async findAll({minSalary, hasEquity, title} = {}){
        let queryValues = [];
        let whereQuery = [];
        let query = `SELECT j.id, j.title, j.salary, j.equity, 
                        j.company_handle AS "companyHandle", c.name AS "companyName"
                    FROM jobs AS j
                        LEFT JOIN companies AS c ON c.handle = j.company_handle`;
        if (title !== undefined){
            queryValues.push(`%${title}%`);
            whereQuery.push(`title ILIKE $${queryValues.length}`)
        }
        if (minSalary !== undefined){
            queryValues.push(minSalary);
            whereQuery.push(`salary >= $${queryValues.length}`)
        }
        if (hasEquity === true){
            whereQuery.push(`equity > 0`)
        }
        if (whereQuery.length > 0) query += " WHERE " + whereQuery.join(" AND ");
        query += " ORDER BY title";
        const jobsRes = await db.query(query, queryValues);
        return jobsRes.rows;
    }

    static async get(id){
        const jobRes = await db.query(`SELECT id, title, salary, equity, 
                                        company_handle AS "companyHandle"
                                      FROM jobs WHERE id =$1`, [id])
        const job = jobRes.rows[0];
        if (!job) throw new NotFoundError(`Job not found: ${id}`);
        const companiesRes = await db.query(`SELECT handle, name, description,
                                                num_employees AS "numEmployees", logo_url AS "logoUrl"
                                                FROM companies WHERE handle = $1`, [job.companyHandle]);
        delete job.companyHandle;
        job.company = companiesRes.rows[0];
        return job;
    }

    static async update(id, data){
        if (!data) throw new BadRequestError();
        const {setCols, values} = sqlForPartialUpdate(data, {});
        const result = await db.query(`UPDATE jobs SET ${setCols} WHERE id = $${values.length+1}
                                        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
                                        [...values, id]);
        const job = result.rows[0];
        if (!job) throw new NotFoundError(`Job not found: ${id}`);
        return job;
    }

    static async remove(id){
        const result = await db.query(`DELETE FROM jobs WHERE id = $1 RETURNING id`, [id]);
        const job = result.rows[0];
        if (!job) throw new NotFoundError(`Job not found: ${id}`);
    }
}

module.exports = Job;