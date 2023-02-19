export type ChangeType = 'insert' | 'delete' | 'normal';

export interface InsertChange {
    type: 'insert';
    content: string;
    lineNumber: number;
    isInsert: true;
}

export interface DeleteChange {
    type: 'delete';
    content: string;
    lineNumber: number;
    isDelete: true;
}

export interface NormalChange {
    type: 'normal';
    content: string;
    isNormal: true;
    oldLineNumber: number;
    newLineNumber: number;
}

export type Change = InsertChange | DeleteChange | NormalChange;

export interface Hunk {
    content: string;
    oldStart: number;
    newStart: number;
    oldLines: number;
    newLines: number;
    changes: Change[];
}

export type FileType = 'add' | 'delete' | 'modify' | 'rename' | 'copy';

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
    type: FileType;
}

export default {
    parse(source: string): File[];
};
