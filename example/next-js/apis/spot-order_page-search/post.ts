// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 现货单批量查询
 * @tags 现价订单管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E7%8E%B0%E4%BB%B7%E8%AE%A2%E5%8D%95%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/searchBatchSpotOrder
 */
export const spotOrderPageSearchPostApi = new RequestBuilder<spotOrderPageSearchPostApi.Req, spotOrderPageSearchPostApi.Res>({
  url: '/spot-order:page-search',
  method: 'post',
  requestFn,
  
  
});

export namespace spotOrderPageSearchPostApi {
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
   * 现货订单批量查询
   */
  params: {
    /**
     * 订单类型 SWAP/SPOT
     */
    marketType: "SWAP" | "SPOT";
    /**
     * 账号ID
     */
    accountId: number;
    /**
     * 订单的状态
     */
    status?: "NEW" | "PARTIALLY_FILLED" | "FILLED" | "CANCELED" | "REJECTED" | "EXPIRED";
    /**
     * 交易对
     */
    symbolId?: number;
    /**
     * 订单的开始时间
     */
    startTime?: number;
    /**
     * 订单结束时间
     */
    endTime?: number;
    /**
     * 订单完成开始时间
     */
    finishedStartTime?: number;
    /**
     * 订单完成结束时间
     */
    finishedEndTime?: number;
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
     * 订单Id
     */
    orderId?: number;
    /**
     * 账号Id
     */
    accountId?: number;
    /**
     * 订单类型 MARKET/LIMIT
     */
    orderType?: string;
    /**
     * 基础货币code
     */
    base?: string;
    /**
     * 计价货币code
     */
    counter?: string;
    /**
     * 买卖方向 BUY/SELL
     */
    side?: string;
    /**
     * 指定基础货币数量
     */
    baseQty?: string;
    /**
     * 指定计价货币数量
     */
    counterQty?: string;
    /**
     * 限定价格(只有限价单才有)
     */
    limitPrice?: string;
    /**
     * 订单状态
     */
    status?: string;
    /**
     * 订单创建时间
     */
    createdTime?: number;
    /**
     * 订单最近一次更新时间
     */
    updatedTime?: number;
    /**
     * 订单最近一次成交时间
     */
    lastTradeTime?: number;
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