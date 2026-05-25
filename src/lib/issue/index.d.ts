import { ISSUE_SEVERITY, ISSUE_SOURCE } from "../../all/const/issue";
import {LOADER_DEPENDENCY_TYPE, LOADER_ENTITY } from "../../all/const/loader";

/*
|--------------------------------------------------------------------------
| ISSUE
|--------------------------------------------------------------------------
*/
export type IssueSeverityType= typeof ISSUE_SEVERITY[keyof typeof ISSUE_SEVERITY];
export type IssueSourceType= typeof ISSUE_SOURCE[keyof typeof ISSUE_SOURCE];

/**
 @description Базовый контракт всех проблем проекта
 */
export interface IssueContract {
    code: string;                          // код проблемы
    message: string;                       // сообщение проблемы
    severity: IssueSeverityType | null;    // уровень строгости 'error' | 'warning'
    source: IssueSourceType;               // источник проблемы 'loader' | 'pipeline' | 'validator' | 'analyzer'
}


/*
|--------------------------------------------------------------------------
| LOADER ISSUE
|--------------------------------------------------------------------------
*/
export type LoaderEntityType= typeof LOADER_ENTITY[keyof typeof LOADER_ENTITY];
export type LoaderDependencyType= typeof LOADER_DEPENDENCY_TYPE[keyof typeof LOADER_DEPENDENCY_TYPE];

export interface LoaderIssueMeta {
    name: string;                          // имя сущности с которой возникла проблема
    entity: LoaderEntityType;              // принадлежность проблемы 'settings' | 'schema' | 'validator' | 'validation'
    target?: unknown;                      // содержимое сущности с которой возникла проблема
    info?: string;                         // дополнительное сообщение (для повышения информативности)
    args?: string[];                       // дополнительные конкретные данные (для блока строки info)
    requestedPath?: string;                // путь, по которому запрашивался ресурс
    resolvedPath?: string;                 // путь, по которому был найден ресурс
    owner?: string;                        // владелец сущности (первоисточник)
    dependencyType?: LoaderDependencyType; // тип зависимости 'resource' | 'schema' | 'extends' | 'import' | 'preset'
    internalPath?: string | string[];      // путь до проблемы внутри ресурса
    error?: Error;                         // объект оригинальной ошибки
    recommendation?: string;               // рекомендация для пользователя
}

export interface LoaderIssueContract extends IssueContract {
    meta: LoaderIssueMeta;
}
