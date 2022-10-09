// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 根据网络id查询网络协议列表
 * @tags 币种管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%B8%81%E7%A7%8D%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/getNetworkProtocol
 */
export const coinsNetworksProtocolsGetApi = new RequestBuilder<coinsNetworksProtocolsGetApi.Req, coinsNetworksProtocolsGetApi.Res>({
  url: '/coins/networks/protocols',
  method: 'get',
  requestFn,
  
});

export namespace coinsNetworksProtocolsGetApi {
 export interface Req {
  networkTypeId: number;
  networkName?: string;
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export type Res = {
  /**
   * 网络协议表id
   */
  id?: number;
  /**
   * 协议所属网络Id
   */
  networkTypeId?: number;
  /**
   * 网络名称
   */
  name?: string;
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

};