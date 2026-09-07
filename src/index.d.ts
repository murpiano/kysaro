import {DETERMINISTIC_FIX_TYPE, FIX_KIND, VALIDATE_STATUS } from './all/const/const';
import { ISSUE_CATEGORY} from './all/const/issue';

export * from './settings/settings.d';


export type ValidateStatusType = typeof VALIDATE_STATUS[keyof typeof VALIDATE_STATUS];
export type DeterministicFixKindType = typeof FIX_KIND.DETERMINISTIC;
export type DeterministicFixType = typeof DETERMINISTIC_FIX_TYPE[keyof typeof DETERMINISTIC_FIX_TYPE];
export type IssueCategoryType = typeof ISSUE_CATEGORY[keyof typeof ISSUE_CATEGORY];


interface DeterministicFixContract {
    kind: DeterministicFixKindType;
    type: DeterministicFixType;
    path: string[];
    from: string;
    to: string;
    rule: string;
}


export interface KysaroContract {
    original: string;
    generated: string | null;
    status: ValidateStatusType | null;
    ignored: boolean;
    normalized: string;
    parsed: {
        raw: string,
        ast: {}
    } | null
    issues: IssueContract[];
    deterministicFixes: DeterministicFixContract[];
    suggestedFixes: SuggestedFix[];
    appliedFixes: AppliedFix[];
    insights: Insight[];

    final: string;
}
