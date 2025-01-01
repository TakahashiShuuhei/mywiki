// 'use server';

import { Datastore } from '@google-cloud/datastore';
import { Article, ArticleKey } from '@/types/article';

const datastore = new Datastore({
  namespace: 'mywiki',
});

const KIND = 'Article';

export const datastoreClient = {
  // 記事の取得
  async getArticle(id: string): Promise<Article | null> {
    const key = datastore.key([KIND, id]);
    const [entity] = await datastore.get(key);
    
    if (!entity) return null;
    
    return {
      id: entity[datastore.KEY].name,
      ...entity
    };
  },

  // 記事一覧の取得
  async listArticles(limit = 10): Promise<Article[]> {
    const query = datastore
      .createQuery(KIND)
      .order('createdAt', { descending: true })
      .limit(limit);
    
    const [entities] = await datastore.runQuery(query);

    return entities.map(entity => ({
      id: entity[datastore.KEY].name,
      ...entity
    }));
  },

  // 記事の作成
  async createArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<ArticleKey> {
    const key = datastore.key([KIND]);
    const now = new Date();
    
    const entity = {
      key,
      data: {
        ...article,
        createdAt: now,
        updatedAt: now,
      },
    };

    await datastore.save(entity);
    return { id: key.name as string };
  },

  // 記事の更新
  async updateArticle(id: string, article: Partial<Article>): Promise<void> {
    const key = datastore.key([KIND, id]);
    const now = new Date();

    const entity = {
      key,
      data: {
        ...article,
        updatedAt: now,
      },
    };

    await datastore.merge(entity);
  },

  // 記事の削除
  async deleteArticle(id: string): Promise<void> {
    const key = datastore.key([KIND, id]);
    await datastore.delete(key);
  }
};