// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 创建资源(同时绑定后端接口)
 * @tags 资源(目录、菜单、页面、按钮)相关的接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E8%B5%84%E6%BA%90(%E7%9B%AE%E5%BD%95%E3%80%81%E8%8F%9C%E5%8D%95%E3%80%81%E9%A1%B5%E9%9D%A2%E3%80%81%E6%8C%89%E9%92%AE)%E7%9B%B8%E5%85%B3%E7%9A%84%E6%8E%A5%E5%8F%A3/create_3
 */
export const resourcesPostApi = new RequestBuilder<resourcesPostApi.Req, resourcesPostApi.Res>({
  url: '/resources',
  method: 'post',
  requestFn,
});

export namespace resourcesPostApi {
 /**
 * 创建资源的请求体
 */
export interface Req {
  /**
   * 资源的类型枚举，PAGE: 页面; BUTTON: 按钮
   */
  type: "BUTTON" | "PAGE";
  /**
   * 父节点id(一级资源的父节点统一为0)
   */
  parentId: number;
  /**
   * 资源编码
   */
  code: string;
  /**
   * 名字(国际化完成前使用)，国际化名字使用code字段
   */
  name: string;
  /**
   * 排序(值越小，排前面)
   */
  sequence?: number;
  /**
   * 组件路由
   */
  router?: string;
  /**
   * 资源路径
   */
  uri?: string;
  /**
   * icon
   */
  icon?: string;
  /**
   * 资源授权访问的后端接口列表
   */
  apiIds: number[];
  [k: string]: unknown;
}

 
 /**
 * 请求返回的结果
 */
export interface Res {
  [k: string]: unknown;
}

};