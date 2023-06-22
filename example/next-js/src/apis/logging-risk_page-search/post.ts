// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 查询风控日志
 * @tags 风控相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E9%A3%8E%E6%8E%A7%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/pageSearchRiskLog
 */
export const loggingRiskPageSearchPostApi = new RequestBuilder<loggingRiskPageSearchPostApi.Req, loggingRiskPageSearchPostApi.Res>({
  url: '/logging-risk:page-search',
  method: 'post',
  requestFn,
});

export namespace loggingRiskPageSearchPostApi {
 /**
 * 分页查询统一结构体
 */
export interface Req {
  /**
   * 页码数, 该值的范围是1~1024
   */
  pageNum: number;
  /**
   * 页大小, 该值的范围是1~99999
   */
  pageSize: number;
  /**
   * 是否查询总记录数。查询总记录数会严重影响性能，非必要不查询.
   */
  count: boolean;
  /**
   * 查询的条件参数. 如果你的查询没有任何条件, 请传入一个空的对象(非null)
   */
  params: {
    /**
     * 用户ID
     */
    userId?: number;
    /**
     * 账户ID
     */
    accountId?: number;
    /**
     * 业务类型
     */
    bizType?: string;
    /**
     * 风控结果
     */
    result?: boolean;
    [k: string]: unknown;
  };
  /**
   * 分页查询的排序规则, 最大不能超过10个排序字段
   *
   * @minItems 0
   * @maxItems 10
   */
  orders?: {
    /**
     * 字段名称
     */
    fieldName: string;
    /**
     * 排序规则
     */
    type: "asc" | "desc";
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}

 
 /**
 * 分页查询结果统计结构体
 */
export interface Res {
  /**
   * 总记录数。如果请求参数中'是否查询总记录数'为true则此参数将会返回.
   */
  total?: number;
  /**
   * 分页查询的结果
   */
  result: {
    /**
     * 日志ID
     */
    id?: number;
    /**
     * 用户ID
     */
    userId?: number;
    /**
     * 用户全称
     */
    fullName?: string;
    /**
     * 账户ID
     */
    accountId?: number;
    /**
     * 业务类型
     */
    bizType?: string;
    /**
     * 业务ID
     */
    txId?: string;
    /**
     * 风控类型
     */
    type?: string;
    /**
     * 风控结果
     */
    result?: boolean;
    /**
     * 数据来源
     */
    source?: string;
    /**
     * 风控错误的描述
     */
    riskDesc?: string;
    /**
     * 风控原始参数
     */
    matchSourceData?: {
      /**
       * 风控原始参数
       */
      [k: string]: {
        [k: string]: unknown;
      };
    };
    /**
     * 事件发生的时间
     */
    eventTime?: string;
    /**
     * 日志写入数据库的时间
     */
    createdTime?: string;
    [k: string]: unknown;
  }[];
  /**
   * 附加值
   */
  extra?: {
    /**
     * 附加值
     */
    [k: string]: {
      [k: string]: unknown;
    };
  };
  [k: string]: unknown;
}

};