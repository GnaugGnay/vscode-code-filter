// 注册的指令id，package.json中需要保持一致
export const COMMAND = 'code-filter.simpleFilter';

// 注册的语言类型id，package.json中需要保持一致
export const LANGUAGE = 'code_filter_unique_id';

// 存储在globalState中数据的键名
export const STATE_KET = 'code_filter_global_state';

// 插件提供给用户的配置项
export const CONFIG = {
  showJumpLineIndex: 'code-filter.showJumpLineIndex',   // 是否显示可点击行序号
}