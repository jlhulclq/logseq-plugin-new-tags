import { QueryResultBlockEntity, QueryResultPageEntity } from 'logseqQueryResultTypes';

export type Tag = {
  name: string;
  usages: Array<QueryResultBlockEntity | QueryResultPageEntity>;
};

export type TagUsageType = 'block' | 'page';
