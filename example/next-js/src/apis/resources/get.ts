// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 根据父资源id查询下一层资源
 * @tags 资源(目录、菜单、页面、按钮)相关的接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E8%B5%84%E6%BA%90(%E7%9B%AE%E5%BD%95%E3%80%81%E8%8F%9C%E5%8D%95%E3%80%81%E9%A1%B5%E9%9D%A2%E3%80%81%E6%8C%89%E9%92%AE)%E7%9B%B8%E5%85%B3%E7%9A%84%E6%8E%A5%E5%8F%A3/listByParentId
 */
export const resourcesGetApi = new RequestBuilder<resourcesGetApi.Req, resourcesGetApi.Res>({
  url: '/resources',
  method: 'get',
  requestFn,
});

export namespace resourcesGetApi {
 export interface Req {
  parentId: number;
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export type Res = {
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
   * 创建时间
   */
  createdTime?: string;
  /**
   * 最后更新时间
   */
  updatedTime?: string;
  /**
   * 资源绑定的api列表
   */
  apis?: {
    /**
     * Api id
     */
    id?: number;
    /**
     * http接口uri
     */
    uri?: string;
    /**
     * http接口方法
     */
    method?: "GET" | "POST" | "PUT" | "DELETE";
    /**
     * 接口的概述
     */
    summary?: string;
    /**
     * 接口所属的领域
     */
    domain?: string;
    /**
     * Api的创建时间
     */
    createdTime?: string;
    /**
     * Api的最后更新时间
     */
    updatedTime?: string;
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}[];

};