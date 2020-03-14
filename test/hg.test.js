const path = require('path');
const fs = require('fs');
const parser = require('../index');

describe("hg specific tests", () => {

    const parse = (filename) => {
        return parser.parse( fs.readFileSync(path.resolve(__dirname, "hg", filename), 'utf-8') );
    };

    it("should have type add", () => {
        const diff = parse("add.diff");
        const file = diff[0];
        expect(file.type).toBe("add");
        expect(file.oldPath).toBe("/dev/null");
        expect(file.newPath).toBe("a.txt");
    });

    it("should have type delete", () => {
        const diff = parse("rm.diff");
        const file = diff[0];
        expect(file.type).toBe("delete");
        expect(file.oldPath).toBe("a.txt");
        expect(file.newPath).toBe("/dev/null");
    });

    it("should have type copy", () => {
        const diff = parse("cp.diff");
        const file = diff[0];
        expect(file.type).toBe("copy");
        expect(file.oldPath).toBe("a.txt");
        expect(file.newPath).toBe("b.txt");
    });

    it("should have type rename", () => {
        const diff = parse("mv.diff");
        const file = diff[0];
        expect(file.type).toBe("rename");
        expect(file.oldPath).toBe("b.txt");
        expect(file.newPath).toBe("c.txt");
    });

    it("should have type modify", () => {
        const diff = parse("edit.diff");
        const file = diff[0];
        expect(file.type).toBe("modify");
        expect(file.oldPath).toBe("a.txt");
        expect(file.newPath).toBe("a.txt");
    });

});