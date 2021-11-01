const path = require('path');
const fs = require('fs');
const parser = require('../index');

describe("git specific tests with no-prefix", () => {

    const parse = (filename) => {
        return parser.parse( fs.readFileSync(path.resolve(__dirname, "git", filename), 'utf-8'), true );
    };

    it("should have type add", () => {
        const diff = parse("add-no-prefix.diff");
        const file = diff[0];
        expect(file.type).toBe("add");
        expect(file.oldPath).toBe("/dev/null");
        expect(file.newPath).toBe("myApp/a.txt");
        expect(file.newMode).toBe('100644');
    });

    it("should have type delete", () => {
        const diff = parse("rm-no-prefix.diff");
        const file = diff[0];
        expect(file.type).toBe("delete");
        expect(file.oldPath).toBe("myApp/a.txt");
        expect(file.oldMode).toBe('100644');
        expect(file.newPath).toBe("/dev/null");
    });

    it("should have type rename", () => {
        const diff = parse("mv-no-prefix.diff");
        const file = diff[0];
        expect(file.type).toBe("rename");
        expect(file.oldPath).toBe("myApp/b.txt");
        expect(file.newPath).toBe("myApp/c.txt");
    });

    it("should have type modify", () => {
        const diff = parse("edit-no-prefix.diff");
        const file = diff[0];
        expect(file.type).toBe("modify");
        expect(file.oldPath).toBe("myApp/a.txt");
        expect(file.newPath).toBe("myApp/a.txt");
        expect(file.oldMode).toBe('100644');
        expect(file.newMode).toBe('100644');
    });

    it("should parse filename correctly if whitespace included", () => {
        const diff = parse("edit-ws-no-prefix.diff");
        const file = diff[0];
        expect(file.type).toBe("modify");
        expect(file.oldPath).toBe("myApp/a b/a.txt");
        expect(file.newPath).toBe("myApp/a b/a.txt");
    });

});