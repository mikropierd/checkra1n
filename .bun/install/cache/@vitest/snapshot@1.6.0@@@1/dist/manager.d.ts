import { S as SnapshotStateOptions, f as SnapshotSummary, b as SnapshotResult } from './index-S94ASl6q.js';
import 'pretty-format';
import './environment-cMiGIVXz.js';

declare class SnapshotManager {
    options: Omit<SnapshotStateOptions, 'snapshotEnvironment'>;
    summary: SnapshotSummary;
    extension: string;
    constructor(options: Omit<SnapshotStateOptions, 'snapshotEnvironment'>);
    clear(): void;
    add(result: SnapshotResult): void;
    resolvePath(testPath: string): string;
    resolveRawPath(testPath: string, rawPath: string): string;
}
declare function emptySummary(options: Omit<SnapshotStateOptions, 'snapshotEnvironment'>): SnapshotSummary;
declare function addSnapshotResult(summary: SnapshotSummary, result: SnapshotResult): void;

export { SnapshotManager, addSnapshotResult, emptySummary };
