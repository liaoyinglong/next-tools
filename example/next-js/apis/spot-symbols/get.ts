// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 根据交易对id查询详情
 * @tags 交易对相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E4%BA%A4%E6%98%93%E5%AF%B9%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/getDetail
 */
export const spotSymbolsGetApi = new RequestBuilder<spotSymbolsGetApi.Req, spotSymbolsGetApi.Res>({
  url: '/spot-symbols',
  method: 'get',
  requestFn,
  
});

export namespace spotSymbolsGetApi {
 export interface Req {
  id: number;
  [k: string]: unknown;
}

 
 /**
 * 交易对详细信息
 */
export interface Res {
  /**
   * 查询交易对返回结果
   */
  spotSymbol?: {
    id?: number;
    /**
     * Symbol，用Base和Counter拼接起来，例如BTC/IDR，则为BTC-IDR
     */
    symbol?: string;
    /**
     * 基础货币id
     */
    baseAssetId?: number;
    /**
     * 基础货币
     */
    baseAsset?: string;
    /**
     * 基础货币名称
     */
    baseAssetName?: string;
    /**
     * 基础货币的图标地址
     */
    baseAssetIconUrl?: string;
    /**
     * 基础货币精度
     */
    baseDecimals?: number;
    /**
     * Counter货币id
     */
    counterAssetId?: number;
    /**
     * 计价货币，数据范围：BUSD和IDR（前提须为已配置币种）。如果Counter计价货币是IDR，需要先检查有没有配置IDR-BUSD的汇率，否则无法创建交易对
     */
    counterAsset?: string;
    /**
     * Counter货币类型(法币, 加密货币)
     */
    counterAssetType?: string;
    /**
     * Counter货币精度
     */
    counterDecimals?: number;
    /**
     * 交易对状态(NEW, ACTIVE, INACTIVE)
     */
    status?: string;
    /**
     * 是否可见(可见, 不可见)
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
    tradeTypes?: string[];
    /**
     * 订单类型,多选允许支持多个（目前只有市价），必填项。1、市价
     */
    orderTypes?: string[];
    /**
     * 备注
     */
    remarks?: string;
    /**
     * 创建人ID
     */
    createdBy?: number;
    /**
     * 创建人
     */
    createdRealName?: string;
    /**
     * 更新人id
     */
    updatedBy?: number;
    /**
     * 更新人
     */
    updatedRealName?: string;
    /**
     * 创建时间
     */
    createdTime?: number;
    /**
     * 更新时间
     */
    updatedTime?: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

};