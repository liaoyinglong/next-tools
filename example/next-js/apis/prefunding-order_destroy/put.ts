// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 作废换汇记录
 * @tags 汇率管理相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E6%B1%87%E7%8E%87%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/cancel
 */
export const prefundingOrderDestroyPutApi = new RequestBuilder<prefundingOrderDestroyPutApi.Req, prefundingOrderDestroyPutApi.Res>({
  url: '/prefunding-order:destroy',
  method: 'put',
  requestFn,
  
  
});

export namespace prefundingOrderDestroyPutApi {
 /**
 * 作废换汇记录
 */
export interface Req {
  /**
   * 表Id
   */
  id: number;
  /**
   * 状态
   */
  status: "NEW" | "ACTIVE" | "INACTIVE";
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  [k: string]: unknown;
}

};