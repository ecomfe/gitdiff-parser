

(function (root) {
    var STAT_START = 2;
    var STAT_FILE_META = 3;
    var STAT_HUNK = 5;




    var parser = {
        parse: function (source) {
            var infos = [];
            var stat = STAT_START;
            var currentInfo;
            var currentHunk;
            var changeOldLine;
            var changeNewLine;


            var lines = source.split('\n');
            var linesLen = lines.length;
            var i = 0;

            while (i < linesLen) {
                var line = lines[i];

                if (line.indexOf('diff --git') === 0) {
                    var segs = line.split(' ');

                    // read file
                    currentInfo = {
                        oldPath: segs[2].slice(2),
                        newPath: segs[3].slice(2),
                        hunks: []
                    };
                    infos.push(currentInfo);

                    // read mode change
                    var nextLine = lines[i + 1];
                    if (nextLine.indexOf('old') === 0) {
                        currentInfo.oldMode = nextLine.slice(9, 16);
                        currentInfo.newMode = lines[i + 2].slice(9, 16);
                        i += 2;
                        nextLine = lines[i + 1];
                    }

                    // read similarity
                    if (nextLine.indexOf('similarity') === 0) {
                        currentInfo.similarity = parseInt(nextLine.split(' ')[2], 10);
                        i += 1;
                    }

                    // read similarity type and index
                    var simiLine;
                    while ((simiLine = lines[++i])) {
                        var segs = simiLine.split(' ');

                        if (segs[0] === 'index') {
                            var revs = segs[1].split('..');
                            currentInfo.oldRevision = revs[0];
                            currentInfo.newRevision = revs[1];

                            if (segs[2]) {
                                currentInfo.oldMode = currentInfo.newMode = segs[2];
                            }
                            stat = STAT_HUNK;

                            if (lines[i + 1].indexOf('---') === 0) {
                                i += 2;
                            }
                            break;
                        }
                        else if (!currentInfo.type) {
                            currentInfo.type = segs[0];
                        }
                    }
                }
                else if (line.indexOf('Binary') === 0) {
                    currentInfo.isBinary = true;
                    stat = STAT_START;
                    currentInfo = null;
                }
                else if (stat === STAT_HUNK) {
                    if (line.indexOf('@@') === 0) {
                        var match = /^@@\s+-([0-9]+)(,([0-9]+))?\s+\+([0-9]+)(,([0-9]+))?/.exec(line)
                        currentHunk = {
                            oldStart: match[1] - 0,
                            newStart: match[4] - 0,
                            oldLines: match[3] - 0 || 0,
                            newLines: match[6] - 0 || 0,
                            changes: []
                        };

                        currentInfo.hunks.push(currentHunk);
                        changeOldLine = currentHunk.oldStart;
                        changeNewLine = currentHunk.newStart;
                    }
                    else {
                        var typeChar = line.slice(0, 1);
                        var change = {
                            content: line.slice(1)
                        };

                        switch (typeChar) {
                            case '+':
                                change.type = 'insert';
                                change.isInsert = true;
                                changeNewLine++;
                                change.lineNumber = changeNewLine;
                                break;

                            case '-':
                                change.type = 'delete';
                                change.isDelete = true;
                                changeOldLine++;
                                change.lineNumber = changeOldLine;
                                break;

                            case ' ':
                                change.type = 'normal';
                                change.isNormal = true;
                                changeOldLine++;
                                changeNewLine++;
                                change.oldLineNumber = changeOldLine;
                                change.newLineNumber = changeNewLine;
                                break;
                        }

                        currentHunk.changes.push(change);
                    }
                }

                i++;
            }


            // var len = source.length;
            // for (var i = 0; i < len; i++) {
            //     source.charAt(i);
            // }
            return infos;
        }
    };

    if (typeof exports === 'object' && typeof module === 'object') {
        // For CommonJS
        exports = module.exports = parser;
    }
    else if (typeof define === 'function' && define.amd) {
        // For AMD
        define('gitDiffParser', [], parser);
    }
    else {
        root.gitDiffParser = parser;
    }
})(this);