import {ERROR_NAMES,ERROR_CODES} from './const';


export type ErrorName = typeof ERROR_NAMES[keyof typeof ERROR_NAMES];
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];


export interface LoadFileError {
  name: ErrorName;
  message: string;
  meta: {
    code: ErrorCode;
    isCritical?: boolean;
    path?: string;
    file?: string;
    args?: string[];
    originalError?: unknown;
  };
}
