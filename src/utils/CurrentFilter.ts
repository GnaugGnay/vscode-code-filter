import { CurrentFilterData } from '../types';

/**
 * 记录当前过滤的一些信息，单例
 */
class CurrentFilter {
  private static instance: CurrentFilter;
  private data: CurrentFilterData;

  constructor() {
    this.data = {
      resultInfos: [],
      emptyResult: false
    };
  }

  public static getInstance() {
    if (!CurrentFilter.instance) {
      CurrentFilter.instance = new CurrentFilter();
    }

    return CurrentFilter.instance;
  }

  set(params: CurrentFilterData) {
    Object.assign(this.data, params);
  }

  get() {
    return this.data;
  }
}

export default CurrentFilter.getInstance();