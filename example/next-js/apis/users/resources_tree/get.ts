// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 获取当前用户所有有权限的资源(树状)
 * @tags 用户的资源相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E7%94%A8%E6%88%B7%E7%9A%84%E8%B5%84%E6%BA%90%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/listTreeByUserId
 */
export const usersResourcesTreeGetApi = new RequestBuilder<usersResourcesTreeGetApi.Req, usersResourcesTreeGetApi.Res>({
  url: '/users/resources:tree',
  method: 'get',
  requestFn,
});

export namespace usersResourcesTreeGetApi {
 export type Req = any;
 
 /**
 * 请求返回的结果
 */
export type Res = Items[];

/**
 * 资源(菜单、页面、按钮)的信息(资源树使用)
 */
export interface Items {
  /**
   * 资源id
   */
  id?: number;
  /**
   * 父节点id
   */
  parentId?: number;
  /**
   * 资源编码
   */
  code?: string;
  /**
   * 名字(国际化完成前使用)，国际化名字使用code字段
   */
  name?: string;
  /**
   * 资源的路径，从父资源到子资源的路径(数组值是code)
   */
  path?: string[];
  /**
   * 排序(值越小，排前面)
   */
  sequence?: number;
  /**
   * 资源的类型，PAGE: 页面; BUTTON: 按钮
   */
  type?: "BUTTON" | "PAGE";
  /**
   * 组件路由
   */
  router?: string;
  /**
   * 资源路径
   */
  uri?: string;
  /**
   * 图标地址
   */
  icon?: string;
  /**
   * 资源状态: false-正常; true-禁用
   */
  disabled?: boolean;
  /**
   * 是否可见
   */
  visible?: boolean;
  /**
   * 最后更新时间
   */
  updatedTime?: string;
  /**
   * 更新资源的用户名字
   */
  updaterName?: string;
  /**
   * 该资源的子资源列表
   */
  children?: Items[];
  [k: string]: unknown;
}

};