// 这个文件由 @dune2/cli 自动生成，不要手动修改，否则会被覆盖
import { RequestBuilder } from '@dune2/tools';
import requestFn from '@/utils/request';
/**
 * 分页查询所有角色(支持根据角色name模糊查询)
 * @tags 后端http接口(即:Api)的相关接口
 * @see http://192.168.104.10:31082/swagger/?urls.primaryName=%E5%90%8E%E5%8F%B0%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3API#/%E5%90%8E%E7%AB%AFhttp%E6%8E%A5%E5%8F%A3(%E5%8D%B3%3AApi)%E7%9A%84%E7%9B%B8%E5%85%B3%E6%8E%A5%E5%8F%A3/pageSearch_7
 */
export const apisPageSearchPostApi = new RequestBuilder<apisPageSearchPostApi.Req, apisPageSearchPostApi.Res>({
  url: '/apis:page-search',
  method: 'post',
  requestFn,
  
  
});

export namespace apisPageSearchPostApi {
 /**
 * 分页查询统一结构体
 */
export interface Req {
  /**
   * 页码数, 该值的范围是1~1024
   */
  pageNum: number;
  /**
   * 页大小, 该值的范围是1~99999
   */
  pageSize: number;
  /**
   * 是否查询总记录数。查询总记录数会严重影响性能，非必要不查询.
   */
  count: boolean;
  /**
   * 查询api的请求参数
   */
  params: {
    /**
     * 根据uri、summary、domain模糊查询
     */
    keyword?: string;
    [k: string]: unknown;
  };
  /**
   * 分页查询的排序规则, 最大不能超过10个排序字段
   *
   * @minItems 0
   * @maxItems 10
   */
  orders?: {
    /**
     * 字段名称
     */
    fieldName: string;
    /**
     * 排序规则
     */
    type: "asc" | "desc";
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}

 
 /**
 * 分页查询结果统计结构体
 */
export interface Res {
  /**
   * 总记录数。如果请求参数中'是否查询总记录数'为true则此参数将会返回.
   */
  total?: number;
  /**
   * 分页查询的结果
   */
  result: {
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
  /**
   * 附加值
   */
  extra?: {
    /**
     * 附加值
     */
    [k: string]: {
      [k: string]: unknown;
    };
  };
  [k: string]: unknown;
}

};