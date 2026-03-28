export type Status = 'required' | 'forbidden' | 'optional';
export type CaseType = 'lower' | 'upper' | 'sentence' | 'firstWordLower' | 'any';

interface Rule {
  use: Status;
  spaceAfter: Status;
  index: number;
}

interface TextRule extends Rule{
  case: CaseType;
}

interface EndSymbolRule extends Pick <Rule, "use"> {
  typeSymbol:string;
}

interface BodyRule extends Rule {
  matchHeader: Status;
}

interface BodyTextRule extends TextRule {
  matchHeader: Status;
}

interface MergeRule extends TextRule {
  useOnlyMerge: Status;
}

interface Base {
  header: {
    minLength: number;
    maxLength: number;
    emoji: Rule;
    type: TextRule;
    scope: TextRule;
    colon: Rule;
    subject: TextRule;
    endSymbol: EndSymbolRule;
  };
  body: {
    required: boolean;
    minLength: number;
    maxLength: number;
    eachItem: {
      maxLength: number;
      startDash: Rule;
      emoji: BodyRule;
      type: BodyTextRule;
      scope: BodyTextRule;
      colon: Rule;
      text: TextRule;
      endSymbol: EndSymbolRule;
    };
  };
}

export interface StandardConfig extends Base {}

export interface MergeConfig extends Omit<Base, 'header'> {
  header: Base['header'] & {
    type: MergeRule;
    "#PRNumber": Rule;
  };
}

export interface RequestConfig extends MergeConfig{}

interface Description {
  description: string
}

interface Type extends Description {
  emoji: string;
}

export interface TypesConfig {
  [key:string] : Type;
}

export interface ScopesConfig {
  [key:string] : Description;
}

export interface TokensConfig {
  [key:string] : Description;
}
