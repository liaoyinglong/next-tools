// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * undefined
 * @tags 汇率管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E6%B1%87%E7%8E%87%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/getPrefundingOrderById
 */
export const prefundingOrderIdGetApi = new RequestBuilder<prefundingOrderIdGetApi.Req, prefundingOrderIdGetApi.Res>({
  url: '/prefunding-order/{id}',
  method: 'get',
  requestFn,
  urlPathParams: ["id"],
});

export namespace prefundingOrderIdGetApi {
 export interface Req {
  id: number;
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  /**
   * 表Id
   */
  id?: number;
  /**
   * 基准类型 assetId
   */
  baseAssetId?: number;
  /**
   * 基准类型
   */
  baseAssetType?: string;
  /**
   * 兑换 assetId
   */
  counterAssetId?: number;
  /**
   * 兑换类型
   */
  counterAssetType?: string;
  /**
   * 基准coin的数量
   */
  baseQty?: string;
  /**
   * 兑换coin的数量
   */
  counterQty?: string;
  /**
   * 中间兑换USD的数量
   */
  usdQty?: string;
  /**
   * 备注
   */
  remarks?: string;
  /**
   * 汇率状态
   */
  status?: string;
  /**
   * 创建人id
   */
  createdBy?: number;
  /**
   * 更新人id
   */
  updatedBy?: number;
  /**
   * 更新人名称
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
}

};