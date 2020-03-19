# gitdiff-parser

A fast and reliable git diff parser.

## Install

```shell
npm install gitdiff-parser
```

## Usage

```js
import gitDiffParser from 'gitdiff-parser';

gitDiffParser.parse(gitDiffText);
```

`gitDiffText` should be a diff output by `git diff` command.

### API

```ts
export interface Change {
    content: string;
    type: 'insert' | 'delete' | 'normal';
    isInsert?: boolean;
    isDelete?: boolean;
    isNormal?: boolean;
    lineNumber?: number;
    oldLineNumber?: number;
    newLineNumber?: number;
}

export interface Hunk {
    content: string;
    oldStart: number;
    newStart: number;
    oldLines: number;
    newLines: number;
    changes: Change[];
}

export interface File {
    hunks: Hunk[];
    oldEndingNewLine: boolean;
    newEndingNewLine: boolean;
    oldMode: string;
    newMode: string;
    similarity?: number;
    oldRevision: string;
    newRevision: string;
    oldPath: string;
    newPath: string;
    isBinary?: boolean;
    type: 'add' | 'delete' | 'modify' ｜ 'rename';
}

export default {
    parse(source: string): File[];
};
```
