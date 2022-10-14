// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 查询交易对列表
 * @tags 交易对相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E4%BA%A4%E6%98%93%E5%AF%B9%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/pageSearch
 */
export const spotSymbolsPageSearchPostApi = new RequestBuilder<spotSymbolsPageSearchPostApi.Req, spotSymbolsPageSearchPostApi.Res>({
  url: '/spot-symbols:page-search',
  method: 'post',
  requestFn,
  
  
});

export namespace spotSymbolsPageSearchPostApi {
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
   * 查询交易对请求参数
   */
  params: {
    /**
     * 通过交易对的基础货币code搜索，模糊搜索
     */
    baseAsset?: string;
    /**
     * 通过交易对的计价货币搜索，精确搜索
     */
    counterAsset?: string;
    /**
     * 计价货币类型(fiat, coin)
     */
    counterAssetType?: "FIAT" | "COIN";
    /**
     * 状态(NEW, ACTIVE, INACTIVE)
     */
    status?: "NEW" | "ACTIVE" | "INACTIVE";
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
    /**
     * 最大市价下单金额
     */
    marketOrderMaxLimit?: string;
    /**
     * 最小下单价格步进间隔
     */
    tickSize?: string;
    /**
     * 最小下单数量步进间隔
     */
    stepSize?: string;
    /**
     * 限价下单价格范围:上限。取值范围>0
     */
    limitedPriceUp?: string;
    /**
     * 限价下单价格范围:下限。取值范围0~100
     */
    limitedPriceDown?: string;
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