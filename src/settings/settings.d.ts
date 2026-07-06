export enum SourcePath {
    TYPES = 'types.json',
    SCOPES = 'scopes.json',
    TOKENS = 'tokens.json',
}

export enum Case {
    LOWER = 'lower',
    UPPER = 'upper',
    SENTENCE = 'sentence',
    KEBAB = 'kebab',
    CAMEL = 'camel',
    PASCAL = 'pascal',
    SNAKE = 'snake',
    MATCH_SOURCE = 'match-source',
    ANY = 'any'
}

export enum Permission {
    ALLOW = 'allow',
    REQUIRE = 'require',
    FORBID = 'forbid',
    ANY = 'any'
}

export enum CommitName {
    STANDARD = 'standard',
    MERGE = 'merge',
    REVERT = 'revert',
    REQUEST = 'request',
}



export enum EndOfLine {
    LF = 'lf',
    CRLF = 'crlf',
    AUTO = 'auto',
}

export enum Switch {
    ON = 'on',
    OFF = 'off'
}

export enum ErrorMode {
    RETURN = 'return',
    THROW = 'throw'
}

export enum FixMode {
    APPLY = 'apply',
    SUGGEST = 'suggest'
}

export enum Severity {
    ERROR = 'error',
    WARNING = 'warn',
}





type CaseType = typeof Case[keyof typeof Case];
type EndOfLineType = typeof EndOfLine[keyof typeof EndOfLine];
type SwitchType = typeof Switch[keyof typeof Switch];
type ErrorModeType = typeof ErrorMode[keyof typeof ErrorMode];
type FixModeType = typeof FixMode[keyof typeof FixMode];
type CommitNameType = typeof CommitName[keyof typeof CommitName];
type SeverityType = typeof Severity[keyof typeof Severity];


interface BlankLinesContract {
    maxConsecutive: number;
    trimStart: boolean;
    trimEnd: boolean;
}

interface NormalizeContract {
    trim: boolean;
    removeTrailingSpaces: boolean;
    blankLines: BlankLinesContract;
    eol?: EndOfLineType;
    ensureFinalNewline?: boolean;
}

interface PipelineConfig {
    normalize: SwitchType
    validate: SwitchType
    fix: SwitchType
    analyzer: 'off'
    ai: 'off'
}

export interface AppMode{
    onError: ErrorModeType;
    onFix: FixModeType;
}

export interface IgnoreConfigContract{
    types?:CommitNameType[];
    patterns?:(string | RegExp)[];
}


export interface ConfigContract {
    normalize: NormalizeContract;
    pipeline: PipelineConfig;
    mode: AppMode;
    ignore?: IgnoreConfigContract;
    severity: SeverityType;
}
















type OnUnknownType = 'error' | 'ignore';

type WhenContract = {
    type?: string[];
    notType?: string[];
    tokens?: string[];
    mode?: 'and' | 'or';
};

type RequiredContract = {
    when: WhenContract;
};

type RequiredFooterContract = {
    when: Omit<WhenContract, 'tokens'>;
};


type BaseSourceContract =
    | 'any'
    | { type: 'inline'; values: string[] };

type RecommendedPaths = typeof SourcePath[keyof typeof SourcePath];
type CustomPath = { type: 'file'; path: string };

type SourceContract<T extends RecommendedPaths> =
    | BaseSourceContract
    | { type: 'file'; path: T }
    | CustomPath;


type TypesSourceContract = SourceContract<SourcePath.TYPES>;
type ScopesSourceContract = SourceContract<SourcePath.SCOPES>;
type TokensSourceContract = SourceContract<SourcePath.TOKENS>;

interface ScopeMultipleContract {
    separator?: string
    separatorSpacing?: Permission.ALLOW | Permission.REQUIRE | Permission.FORBID;
    minItems?: number
    maxItems?: number
    trimItems?: boolean
    disallowEmpty?: boolean
    unique?: boolean
}




interface TypeContract {
    source: TypesSourceContract;
    case: Case.LOWER | Case.UPPER | Case.SENTENCE | Case.MATCH_SOURCE | Case.ANY;
    onUnknown?: OnUnknownType;
}

interface ScopeContract {
    required: boolean | RequiredContract;
    allowEmpty?: boolean;
    source: ScopesSourceContract;
    onUnknown?: OnUnknownType;
    case: CaseType;
    multiple?: ScopeMultipleContract;
    onMultiple: 'error' | 'first' | 'join';
}

interface SubjectContract {
    minLength: number;
    case: Case.LOWER | Case.SENTENCE | Case.ANY;
    trim?: boolean;
    disallowTrailingPeriod?: boolean;
}

export interface FooterTokenContract {
    source: TokensSourceContract;
    case: Case.LOWER | Case.UPPER | Case.MATCH_SOURCE | Case.ANY;
    onUnknown?: OnUnknownType;
}
export interface FooterValueContract {
    minLength: number;
    case: Case.LOWER | Case.UPPER | Case.SENTENCE | Case.ANY;
}

export interface MultipleTokensContract {
    minItems?: number
    maxItems?: number
}


interface HeaderContract {
    maxLength: number;
    format: 'type(scope): subject';
    type: TypeContract;
    scope: ScopeContract;
    subject: SubjectContract;
}

interface BodyContract {
    required: boolean | RequiredContract;
    blankLineBefore: boolean;
    maxLineLength: number;
    trim?: boolean;
    maxConsecutiveEmptyLines?: boolean;
}

interface FooterContract {
    required: boolean | RequiredFooterContract;
    blankLineBefore: boolean;
    maxLineLength: number;
    format: 'token: value';
    token: FooterTokenContract;
    value: FooterValueContract;
    multiple?: MultipleTokensContract;
    uniqueTokens?: boolean
}

interface BreakingChangeContract {
    header:Permission.ALLOW | Permission.FORBID | Permission.REQUIRE;
    footer:Permission.ALLOW | Permission.FORBID | Permission.REQUIRE;
    requireFooterDescription?: boolean;
    requireAtLeastOne?: boolean;
}

export interface CommitContract {
    preset?: string;
    header: HeaderContract;
    body: BodyContract;
    footer: FooterContract;
    breakingChange?: BreakingChangeContract,
}


interface Description {
    description: string
}

export interface TypesConfig {
    [key: string]: Description;
}

export interface ScopesConfig {
    [key: string]: Description;
}

export interface TokensConfig {
    [key: string]: Description;
}







// interface LintResult {
//     valid: boolean
//
//     original: string
//     normalized?: string
//
//     parsed?: {
//         header: any
//         body: any
//         footer: any
//     }
//
//     errors: LintError[]
//     fixes?: Fix[]
//
//     output: string
// }
