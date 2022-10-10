// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 分页查询币种信息
 * @tags 币种管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%B8%81%E7%A7%8D%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/pageSearch_4
 */
export const coinsPageSearchPostApi = new RequestBuilder<coinsPageSearchPostApi.Req, coinsPageSearchPostApi.Res>({
  url: '/coins:page-search',
  method: 'post',
  requestFn,
  
});

export namespace coinsPageSearchPostApi {
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
   * 币种列表查询参数
   */
  params: {
    /**
     * 币种代码或者币种名称
     */
    nameOrCode?: string;
    /**
     * 币种状态(NEW, ACTIVE, INACTIVE)
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
    /**
     * 币种管理
     */
    coin?: {
      /**
       * 币种id
       */
      id?: number;
      /**
       * crypto来源Id，crypto_datasource表的Id
       */
      sourceId?: number;
      /**
       * Coin的名称，如：Bitcoin
       */
      name?: string;
      /**
       * Coin的符号，如：BTC
       */
      code?: string;
      /**
       * 币种状态(NEW,ACTIVE,INACTIVE)
       */
      status?: string;
      /**
       * 资产显示精度
       */
      decimals?: number;
      /**
       * 币种icon
       */
      iconUrl?: string;
      /**
       * 支持充值
       */
      canDeposit?: boolean;
      /**
       * 支持体现
       */
      canWithdraw?: boolean;
      /**
       * 备注
       */
      remarks?: string;
      /**
       * 创建人id
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
    /**
     * 币种支持的网络
     */
    networks?: {
      /**
       * 表Id，coin唯一标识
       */
      id?: number;
      /**
       * 币种的唯一标识，用于将网络关联到币种
       */
      coinId?: number;
      /**
       * 网络类型Id
       */
      networkTypeId?: number;
      /**
       * network对应的网络名称，例如Ethereum
       */
      networkTypeName?: string;
      /**
       * 协议类型Id
       */
      protocolTypeId?: number;
      /**
       * network对应的协议，例如ERC20
       */
      protocolTypeName?: string;
      /**
       * 是否支持充币或者提币标签备注
       */
      canMemo?: boolean;
      /**
       * 支持充值
       */
      canDeposit?: boolean;
      /**
       * 支持提现
       */
      canWithdraw?: boolean;
      /**
       * Crypto中台收取的提币或者充币手续费用
       */
      withdrawFees?: string;
      /**
       * 最小提币数量
       */
      minWithdrawAmount?: string;
      /**
       * 资产Id
       */
      assetId?: string;
      /**
       * 资产来源。FireBlocks CyraWallet
       */
      assetSource?: string;
      /**
       * 网络状态
       */
      status?: string;
      /**
       * 备注
       */
      remarks?: string;
      /**
       * 创建人ID
       */
      createdBy?: number;
      /**
       * 更新人ID
       */
      updatedBy?: number;
      /**
       * 创建时间
       */
      createdTime?: number;
      /**
       * 更新时间
       */
      updatedTime?: number;
      [k: string]: unknown;
    }[];
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