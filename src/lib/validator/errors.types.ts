import {FIX_TYPES} from '../../all/const/issue';

type FixType = typeof FIX_TYPES [keyof typeof FIX_TYPES];

type ValidationError = {
  code: string;
  message: string;
  path: string[];
  category: 'format' | 'entity' | 'length' | 'semantic';
  fixable: boolean;
  fix?: {
    type: FixType;
    payload?: any;
  };
  priority?: number;
};
