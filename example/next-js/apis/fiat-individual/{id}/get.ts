// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 获取个人黑名单详情
 * @tags 黑名单管理控制
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E9%BB%91%E5%90%8D%E5%8D%95%E7%AE%A1%E7%90%86%E6%8E%A7%E5%88%B6/getFiatIndividualById
 */
export const fiatIndividualIdGetApi = new RequestBuilder<fiatIndividualIdGetApi.Req, fiatIndividualIdGetApi.Res>({
  url: '/fiat-individual/{id}',
  method: 'get',
  requestFn,
  urlPathParams: ["id"],
});

export namespace fiatIndividualIdGetApi {
 export interface Req {
  id: number;
  [k: string]: unknown;
}

 
 /**
 * 黑名单个人详细信息
 */
export interface Res {
  /**
   * 数据源id
   */
  dataId?: string;
  /**
   * 来源
   */
  source?: string;
  /**
   * 名称
   */
  fullName?: string;
  /**
   * 别名列表
   */
  names?: string[];
  /**
   * 国籍
   */
  country?: string[];
  /**
   * 出生地
   */
  placeOfBirth?: string[];
  /**
   * 证件类型
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
   * 生日
   */
  dateOfBirth?: string[];
  [k: string]: unknown;
}

};