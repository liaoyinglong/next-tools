// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 获取企业黑名单详情
 * @tags 黑名单管理控制
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E9%BB%91%E5%90%8D%E5%8D%95%E7%AE%A1%E7%90%86%E6%8E%A7%E5%88%B6/getFiatEntityById
 */
export const fiatEntityIdGetApi = new RequestBuilder<fiatEntityIdGetApi.Req, fiatEntityIdGetApi.Res>({
  url: '/fiat-entity/{id}',
  method: 'get',
  requestFn,
  urlPathParams: ["id"],
  
});

export namespace fiatEntityIdGetApi {
 export interface Req {
  id: number;
  [k: string]: unknown;
}

 
 /**
 * 企业黑名单详情
 */
export interface Res {
  /**
   * 数据Id
   */
  dataId?: string;
  /**
   * 来源
   */
  source?: string;
  /**
   * Fiat机构全名
   */
  fullName?: string;
  /**
   * Fiat机构别名
   */
  names?: string[];
  /**
   * Fiat机构注册号列表
   */
  fiatIdentities?: {
    /**
     * 类型
     */
    type?: string;
    /**
     * 号码
     */
    number?: string;
    [k: string]: unknown;
  }[];
  /**
   * Fiat机构注册号列表
   */
  addresses?: {
    address?: {
      [k: string]: string;
    };
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}

};