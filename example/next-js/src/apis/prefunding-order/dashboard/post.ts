// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 换汇统计
 * @tags 汇率管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E6%B1%87%E7%8E%87%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/dashboard
 */
export const prefundingOrderDashboardPostApi = new RequestBuilder<prefundingOrderDashboardPostApi.Req, prefundingOrderDashboardPostApi.Res>({
  url: '/prefunding-order/dashboard',
  method: 'post',
  requestFn,
});

export namespace prefundingOrderDashboardPostApi {
 /**
 * 查询请求参数
 */
export interface Req {
  /**
   * 基础货币ID
   */
  baseAssetId: number;
  /**
   * 基础货币类型
   */
  baseAssetType: "FIAT" | "COIN";
  /**
   * 计价货币ID
   */
  counterAssetId: number;
  /**
   * 计价货币类型
   */
  counterAssetType: "FIAT" | "COIN";
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  /**
   * 基准类型 assetId
   */
  baseAssetId?: number;
  /**
   * 基准累计总量
   */
  baseTotal?: string;
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
   * 兑换累计总量
   */
  counterTotal?: string;
  /**
   * 原始汇率
   */
  originalRate?: string;
  /**
   * base > counter 基点
   */
  baseToCounterBasePoint?: string;
  /**
   * counter > base 基点
   */
  counterToBaseBasePoint?: string;
  [k: string]: unknown;
}

};