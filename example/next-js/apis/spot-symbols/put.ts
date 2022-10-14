// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 更新交易对
 * @tags 交易对相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E4%BA%A4%E6%98%93%E5%AF%B9%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/update_1
 */
export const spotSymbolsPutApi = new RequestBuilder<spotSymbolsPutApi.Req, spotSymbolsPutApi.Res>({
  url: '/spot-symbols',
  method: 'put',
  requestFn,
  
  
});

export namespace spotSymbolsPutApi {
 /**
 * 更新交易对请求参数
 */
export interface Req {
  /**
   * 更新交易对
   */
  spotSymbol?: {
    /**
     * 交易对id
     */
    id: number;
    /**
     * 基础货币id
     */
    baseAssetId?: number;
    /**
     * 基础货币精度
     */
    baseDecimals?: number;
    /**
     * Counter货币id
     */
    counterAssetId?: number;
    /**
     * Counter货币类型(法币, 加密货币)
     */
    counterAssetType?: "FIAT" | "COIN";
    /**
     * Counter货币精度
     */
    counterDecimals?: number;
    /**
     * 交易对状态(NEW, ACTIVE, INACTIVE)
     */
    status?: "NEW" | "ACTIVE" | "INACTIVE";
    /**
     * 是否可见
     */
    visible?: boolean;
    /**
     * 最小下单数量（Base数量），不得大于Base精度
     */
    minTradeAmount?: string;
    /**
     * 最小下单金额（Counter数量），不得大于Counter币种本身的精度
     */
    minOrderAmount?: string;
    /**
     * 交易类型,多选允许支持多个（目前只有市价）。1、现货
     */
    tradeTypes?: "Spot"[];
    /**
     * 订单类型,多选允许支持多个（目前只有市价），必填项。1、市价
     */
    orderTypes?: ("MARKET" | "PRESENT_PRICE" | "STOP_PROFIT_STOP_LOSS" | "PLAN" | "SELECTIVE")[];
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 最大市价下单金额
     */
    marketOrderMaxLimit?: string;
    /**
     * 最小下单价格步进间隔，如Tick Size为0.2，价格只能10.2，10.4等，不允许出现10.3的价格下单。数值精度不允许超过Counter精度
     */
    tickSize: string;
    /**
     * 最小下单数量步进间隔，如Step Size为10，数量只能10，20等，不允许出现11的数量下单。数值精度不允许超过Base精度
     */
    stepSize: string;
    /**
     * 限价下单价格范围:上限。取值范围>0
     */
    limitedPriceUp?: string;
    /**
     * 限价下单价格范围:下限。取值范围0~100
     */
    limitedPriceDown?: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  [k: string]: unknown;
}

};