const {sqlForPartialUpdate} = require("./sql");

describe("sqlForPartialUpdate", () => {
    test("Will work with one item", () => {
        const result = sqlForPartialUpdate({test: "test2"}, {test: "test"});
        expect(result).toEqual({setCols: "\"test\"=$1", values: ["test2"],})
    });
    test("Will work with multiple items", () => {
        const result = sqlForPartialUpdate({test: "test2", test2: "test"}, {test: "test"});
        expect(result).toEqual({setCols: "\"test\"=$1, \"test2\"=$2", values: ["test2", "test"],})
    });
});