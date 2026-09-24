export * from './settings/settings';

export type ValidateStatusType = 'valid' | 'invalid' | 'ignored';

export type IssueSeverityType = 'error' | 'warning';

export type IssueSourceType = 'loader' | 'pipeline' | 'validator' | 'analyzer';

export type IssueCategoryType = 'format' | 'entity' | 'length' | 'semantic' | 'structure';

export type DeterministicFixType =
    | 'trim'
    | 'remove'
    | 'insert'
    | 'lowercase'
    | 'uppercase'
    | 'sentenceCase'
    | 'slice'
    | 'replace'
    | 'wrap';

export interface IssueContract {
    code: string;
    message: string;
    severity: IssueSeverityType | null;
    source: IssueSourceType;
    category?: IssueCategoryType;
    path?: string[];
    meta?: Record<string, unknown>;
}

export interface DeterministicFixContract {
    kind: 'deterministic';
    type: DeterministicFixType;
    path: string[];
    from: string;
    to: string;
    /** Issue code that produced the fix. */
    rule: string;
}

export interface SuggestedFixContract {
    type: 'replace';
    target: 'type' | 'scope' | 'token';
    from: string;
    to: string;
    confidence: number;
}

export interface FooterTokenAst {
    key: string;
    separator: ': ' | ' #';
    value: string;
}

export interface MessageAst {
    header: {
        raw: string;
        type: string | null;
        /** `null` without parentheses, `''` for empty parentheses. */
        scope: string | null;
        breaking: boolean;
        subject: string | null;
    };
    body: {
        raw: string;
        lines: string[];
        /** Zero-based index of the first body line in the message. */
        start: number | null;
        blankLineBefore: boolean | null;
    };
    footer: {
        raw: string;
        lines: string[];
        tokens: FooterTokenAst[];
        start: number | null;
        blankLineBefore: boolean | null;
    };
}

export interface ParsedMessage {
    raw: string;
    ast: MessageAst;
}

export interface KysaroContract {
    original: string;
    generated: string | null;
    status: ValidateStatusType | null;
    ignored: boolean;
    normalized: string;
    parsed: ParsedMessage | null;
    issues: IssueContract[];
    deterministicFixes: DeterministicFixContract[];
    suggestedFixes: SuggestedFixContract[];
    appliedFixes: unknown[];
    insights: unknown[];
    final: string;
}

export declare const COMMIT_TYPE: {
    readonly COMMIT: 'standard_commit';
    readonly REQUEST: 'pull_request';
    readonly MERGE: 'merge_commit';
};

export type CommitKindType = typeof COMMIT_TYPE[keyof typeof COMMIT_TYPE];

export interface LoaderConfiguration {
    settingsDir: {
        user: string | null;
        default: string;
    };
    settingsGroups: Record<string, string[]>;
    reportDir: string | null;
}

export interface LoaderOptions {
    result?: {
        report?: {enabled?: boolean; dir?: string | null};
        cli?: {enabled?: boolean; mode?: 'always' | 'never' | 'issues' | 'critical'};
    };
}

export interface LintOptions {
    /** Message kind. Detected from the environment when omitted. */
    type?: CommitKindType | null;
    /** Project root with optional `.kysaro/settings`. Defaults to `process.cwd()`. */
    cwd?: string;
    loader?: LoaderOptions;
}

/**
 * Checks a message with the settings of a project.
 */
export declare function lint(message: string, options?: LintOptions): KysaroContract;

/**
 * Runs the pipeline with an explicit loader configuration.
 */
export declare function pipeline(
    raw?: string,
    manualCommitType?: CommitKindType | null,
    configuration?: LoaderConfiguration,
    loaderOptions?: LoaderOptions
): KysaroContract;

/**
 * Parses a message into an AST without validation.
 */
export declare function parseMessage(rawMessage: string): ParsedMessage;

/**
 * Creates loader configuration for a project directory.
 */
export declare function createConfiguration(cwd?: string): LoaderConfiguration & {DIRECTORY: Record<string, unknown>};

/**
 * Thrown by `lint` and `pipeline` when `output.invalid` is `throw`.
 */
export declare class KysaroException extends Error {
    result: KysaroContract;
    code: string;
}
