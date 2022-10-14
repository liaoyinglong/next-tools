// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 现货单详情
 * @tags 现价订单管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E7%8E%B0%E4%BB%B7%E8%AE%A2%E5%8D%95%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/getSpotOrderDetailByOrderId
 */
export const spotOrderOrderIdGetApi = new RequestBuilder<spotOrderOrderIdGetApi.Req, spotOrderOrderIdGetApi.Res>({
  url: '/spot-order/{orderId}',
  method: 'get',
  requestFn,
  urlPathParams: ["orderId"],
  
});

export namespace spotOrderOrderIdGetApi {
 export interface Req {
  orderId: number;
  [k: string]: unknown;
}

 
 /**
 * 现货订单明细信息
 */
export interface Res {
  /**
   * 订单Id
   */
  orderId?: number;
  /**
   * 订单类型 MARKET/LIMIT
   */
  orderType?: string;
  /**
   * 账号ID
   */
  accountId?: number;
  /**
   * 买卖方向 BUY/SELL
   */
  side?: string;
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
  /**
   * 基础货币code
   */
  base?: string;
  /**
   * 计价货币code
   */
  counter?: string;
  /**
   * 指定基础货币数量
   */
  baseQty?: string;
  /**
   * 指定计价货币数量
   */
  counterQty?: string;
  /**
   * 实际成交基础货币数量
   */
  tradeBaseQty?: string;
  /**
   * 实际成交计价货币数量
   */
  tradeCounterQty?: string;
  /**
   * 实际成交价
   */
  tradePrice?: string;
  /**
   * 计价货币总数量
   */
  counterTotalQty?: string;
  /**
   * 手续费
   */
  spotOrderFees?: {
    /**
     * 费用类型
     */
    type?: string;
    /**
     * 费用值
     */
    value?: string;
    /**
     * 费用对应的资产code
     */
    assetCode?: string;
    [k: string]: unknown;
  }[];
  /**
   * 成交单
   */
  spotOrderTrades?: {
    /**
     * 成交单id
     */
    tradeId?: number;
    /**
     * accountId
     */
    accountId?: number;
    /**
     * 方向
     */
    side?: string;
    /**
     * 成交时间
     */
    tradeTime?: number;
    /**
     * 基础货币code
     */
    base?: string;
    /**
     * 计价货币code
     */
    counter?: string;
    /**
     * 实际成交基础货币数量
     */
    baseQty?: string;
    /**
     * 实际成交计价货币数量
     */
    counterQty?: string;
    /**
     * 实际成交价格
     */
    price?: string;
    /**
     * MARKET / TAKER
     */
    role?: string;
    /**
     * 手续费
     */
    spotOrderFees?: {
      /**
       * 费用类型
       */
      type?: string;
      /**
       * 费用值
       */
      value?: string;
      /**
       * 费用对应的资产code
       */
      assetCode?: string;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}

};