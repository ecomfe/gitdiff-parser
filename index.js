/**
 * @file gitdiff 消息解析器
 * @author errorrik(errorrik@gmail.com)
 */

(function (root) {
    var STAT_START = 2;
    var STAT_FILE_META = 3;
    var STAT_HUNK = 5;




    var parser = {
        /**
         * 解析 gitdiff 消息
         *
         * @param {string} source gitdiff消息内容
         * @return {Object}
         */
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
                    var filesStr = line.slice(11);
                    var oldPath = null;
                    var newPath = null;

                    var quoteIndex = filesStr.indexOf('"');
                    switch (quoteIndex) {
                        case -1:
                            var segs = filesStr.split(' ');
                            oldPath = segs[0].slice(2);
                            newPath = segs[1].slice(2);
                            break;

                        case 0:
                            var nextQuoteIndex = filesStr.indexOf('"', 2);
                            oldPath = filesStr.slice(3, nextQuoteIndex);
                            var newQuoteIndex = filesStr.indexOf('"', nextQuoteIndex + 1);
                            if (newQuoteIndex < 0) {
                                newPath = filesStr.slice(nextQuoteIndex + 4);
                            }
                            else {
                                newPath = filesStr.slice(newQuoteIndex + 3, -1);
                            }
                            break;

                        default:
                            var segs = filesStr.split(' ');
                            oldPath = segs[0].slice(2);
                            newPath = segs[1].slice(3, -1);
                            break;
                    }


                    // read file
                    currentInfo = {
                        oldPath: oldPath,
                        newPath: newPath,
                        hunks: [],
                        oldEndingNewLine: true,
                        newEndingNewLine: true
                    };

                    infos.push(currentInfo);


                    // 1. 如果oldPath是/dev/null就是add
                    // 2. 如果newPath是/dev/null就是delete
                    // 3. 如果有 rename from foo.js 这样的就是rename
                    // 4. 如果有 copy from foo.js 这样的就是copy
                    // 5. 其它情况是modify
                    var currentInfoType = null;

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
                    simiLoop: while ((simiLine = lines[++i])) {
                        var segs = simiLine.split(' ');

                        switch (segs[0]) {
                            case 'diff': // diff --git
                                i--;
                                break simiLoop;

                            case 'index':
                                var revs = segs[1].split('..');
                                currentInfo.oldRevision = revs[0];
                                currentInfo.newRevision = revs[1];

                                if (segs[2]) {
                                    currentInfo.oldMode = currentInfo.newMode = segs[2];
                                }
                                stat = STAT_HUNK;

                                var oldFileName = lines[i + 1];
                                if (oldFileName.indexOf('---') === 0) {
                                    var newFileName = lines[i + 2];

                                    if (/\s\/dev\/null$/.test(oldFileName)) {
                                        currentInfo.oldPath = '/dev/null';
                                        currentInfoType = 'add';
                                    }
                                    else if (/\s\/dev\/null$/.test(newFileName)) {
                                        currentInfo.newPath = '/dev/null';
                                        currentInfoType = 'delete';
                                    }

                                    i += 2;
                                }

                                break simiLoop;

                        }

                        if (!currentInfoType) {
                            currentInfoType = segs[0];
                        }
                    }

                    currentInfo.type = currentInfoType || 'modify';
                }
                else if (line.indexOf('Binary') === 0) {
                    currentInfo.isBinary = true;
                    currentInfo.type = line.indexOf('/dev/null and') >= 0
                        ? 'add'
                        : (line.indexOf('and /dev/null') >= 0 ? 'delete' : 'modify');
                    stat = STAT_START;
                    currentInfo = null;
                }
                else if (stat === STAT_HUNK) {
                    if (line.indexOf('@@') === 0) {
                        var match = /^@@\s+-([0-9]+)(,([0-9]+))?\s+\+([0-9]+)(,([0-9]+))?/.exec(line)
                        currentHunk = {
                            content: line,
                            oldStart: match[1] - 0,
                            newStart: match[4] - 0,
                            oldLines: match[3] - 0 || 1,
                            newLines: match[6] - 0 || 1,
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
                                change.lineNumber = changeNewLine;
                                changeNewLine++;
                                break;

                            case '-':
                                change.type = 'delete';
                                change.isDelete = true;
                                change.lineNumber = changeOldLine;
                                changeOldLine++;
                                break;

                            case ' ':
                                change.type = 'normal';
                                change.isNormal = true;
                                change.oldLineNumber = changeOldLine;
                                change.newLineNumber = changeNewLine;
                                changeOldLine++;
                                changeNewLine++;
                                break;

                            case '\\': // Seems "no newline" is the only case starting with /
                                var lastChange = currentHunk.changes[currentHunk.changes.length - 1];
                                if (!lastChange.isDelete) {
                                    currentInfo.newEndingNewLine = false;
                                }
                                if (!lastChange.isInsert) {
                                    currentInfo.oldEndingNewLine = false;
                                }
                        }

                        change.type && currentHunk.changes.push(change);
                    }
                }

                i++;
            }

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
