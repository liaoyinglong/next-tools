// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 现货单笔记录查询
 * @tags 现价订单管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E7%8E%B0%E4%BB%B7%E8%AE%A2%E5%8D%95%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/searchSingleSpotOrder
 */
export const spotOrderSinglePageSearchPostApi = new RequestBuilder<spotOrderSinglePageSearchPostApi.Req, spotOrderSinglePageSearchPostApi.Res>({
  url: '/spot-order-single:page-search',
  method: 'post',
  requestFn,
  
  
});

export namespace spotOrderSinglePageSearchPostApi {
 /**
 * 现货单笔订单查询
 */
export interface Req {
  /**
   * 订单类型 SWAP/SPOT
   */
  marketType: "SWAP" | "SPOT";
  /**
   * 订单ID
   */
  orderId: number;
  [k: string]: unknown;
}

 
 /**
 * 现货订单响应结果
 */
export interface Res {
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
}

};