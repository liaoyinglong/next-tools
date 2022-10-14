// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 角色的权限设置
 * @tags 角色相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E8%A7%92%E8%89%B2%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/roleBindResources
 */
export const rolesResourcesBindPutApi = new RequestBuilder<rolesResourcesBindPutApi.Req, rolesResourcesBindPutApi.Res>({
  url: '/roles/resources:bind',
  method: 'put',
  requestFn,
  
  
});

export namespace rolesResourcesBindPutApi {
 /**
 * 角色绑定资源的请求体
 */
export interface Req {
  /**
   * 角色id
   */
  id: number;
  /**
   * 待绑定的资源的id列表
   */
  resourceIds: number[];
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  [k: string]: unknown;
}

};