import { QueryResultBlockEntity, QueryResultPageEntity } from 'logseqQueryResultTypes';

export type TagUsageEntity = QueryResultBlockEntity | QueryResultPageEntity;

export type Tag = {
  name: string;
  usages: Array<TagUsageEntity>;
};

export type TagUsageType = 'block' | 'page';

// 层级树节点类型
export type TagTreeNode = {
  // 当前段名，例如 "公司"、"宣传部人员"、"小明"
  name: string;
  // 完整路径，例如 "公司/宣传部人员/小明"
  fullPath: string;
  // 该完整路径对应的“直接用法”
  selfUsages: Array<TagUsageEntity>;
  // 子节点
  children: Map<string, TagTreeNode>;
  // 含全部子孙在内的聚合计数
  totalCount: number;
};
