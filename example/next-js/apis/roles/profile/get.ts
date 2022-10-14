// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 根据角色id查询角色详情
 * @tags 角色相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E8%A7%92%E8%89%B2%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/getDetail_1
 */
export const rolesProfileGetApi = new RequestBuilder<rolesProfileGetApi.Req, rolesProfileGetApi.Res>({
  url: '/roles/profile',
  method: 'get',
  requestFn,
  
  
});

export namespace rolesProfileGetApi {
 export interface Req {
  id: number;
  [k: string]: unknown;
}

 
 /**
 * 角色信息
 */
export interface Res {
  /**
   * 角色id
   */
  id?: number;
  /**
   * 角色名字
   */
  name?: string;
  /**
   * 角色的状态: true-禁用; false-正常
   */
  disabled?: boolean;
  /**
   * 角色的描述
   */
  description?: string;
  /**
   * 角色的最后更新时间
   */
  updatedTime?: string;
  /**
   * 角色的最后更新用户id
   */
  updatedBy?: number;
  /**
   * 更新角色的用户名字
   */
  updaterName?: string;
  [k: string]: unknown;
}

};