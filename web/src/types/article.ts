export interface Article {
  id?: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export type ArticleKey = {
  id: string;
};
