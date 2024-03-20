// 注册的指令id，package.json中需要保持一致
export enum COMMANDS {
  SIMPLE_FILETER = 'code-filter.simpleFilter',
  OPENED_DOC_FILTER = 'code-filter.openedDocFilter'
}

// 注册的语言类型id，package.json中需要保持一致
export const LANGUAGE = 'code_filter_unique_id';

// 存储在globalState中数据的键名
export const STATE_KET = 'code_filter_global_state';

// 插件提供给用户的配置项
export const CONFIG = {
  pureResult: 'code-filter.pureResult'
}