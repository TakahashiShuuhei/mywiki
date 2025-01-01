import { datastore } from '@/lib/datastore/client';
import { TreeNode, TreeStructure, ROOT_NODE_ID } from '@/types/tree';

const TREE_KEY = ['System', 'tree'];

export const TreeModel = {
  // ツリー構造の取得
  async get(): Promise<TreeStructure> {
    const [entity] = await datastore.get(datastore.key(TREE_KEY));
    // 初期状態を定義
    const initialTree: TreeStructure = {
      tree: [{
        id: ROOT_NODE_ID,
        title: 'ホーム',
        children: []
      }],
      version: 0,
      updatedAt: new Date().toISOString()
    };
    
    return entity || initialTree;
  },

  // 親記事の末尾に子ページを追加
  async addChild(
    parentId: string,
    id: string,
    title: string,
    currentTree: TreeStructure
  ): Promise<TreeStructure> {
    const addChildNode = (nodes: TreeNode[]): boolean => {
      if (!parentId) {
        nodes.push({ id, title, children: [] });
        return true;
      }

      for (const node of nodes) {
        if (node.id === parentId) {
          node.children.push({ id, title, children: [] });
          return true;
        }
        if (node.children.length > 0 && addChildNode(node.children)) {
          return true;
        }
      }
      return false;
    };

    const updatedTree = {
      tree: [...currentTree.tree],
      version: currentTree.version + 1,
      updatedAt: new Date().toISOString()
    };

    if (!addChildNode(updatedTree.tree)) {
      throw new Error('Parent node not found');
    }

    return updatedTree;
  },

  // 指定したページとその配下を全て削除
  async removeSubtree(
    id: string,
    currentTree: TreeStructure
  ): Promise<TreeStructure> {
    const removeNodeRecursive = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.filter(node => {
        if (node.id === id) return false;
        if (node.children.length > 0) {
          node.children = removeNodeRecursive(node.children);
        }
        return true;
      });
    };

    const updatedTree = {
      tree: removeNodeRecursive([...currentTree.tree]),
      version: currentTree.version + 1,
      updatedAt: new Date().toISOString()
    };

    return updatedTree;
  },

  // ページのタイトルを更新
  updateTitle(
    id: string,
    newTitle: string,
    currentTree: TreeStructure
  ): TreeStructure {
    const updateTitleRecursive = (nodes: TreeNode[]): boolean => {
      for (const node of nodes) {
        if (node.id === id) {
          node.title = newTitle;
          return true;
        }
        if (node.children.length > 0 && updateTitleRecursive(node.children)) {
          return true;
        }
      }
      return false;
    };

    const updatedTree = {
      tree: [...currentTree.tree],
      version: currentTree.version + 1,
      updatedAt: new Date().toISOString()
    };

    if (!updateTitleRecursive(updatedTree.tree)) {
      throw new Error('Node not found');
    }

    return updatedTree;
  },

  // ページを指定した位置に移動
  async moveNode(
    nodeId: string,
    newParentId: string,
    currentTree: TreeStructure,
    index?: number
  ): Promise<TreeStructure> {
    let nodeToMove: TreeNode | null = null;

    // ノードを見つけて削除
    const removeNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.filter(node => {
        if (node.id === nodeId) {
          nodeToMove = { ...node };
          return false;
        }
        if (node.children.length > 0) {
          node.children = removeNode(node.children);
        }
        return true;
      });
    };

    const updatedTree = {
      tree: removeNode([...currentTree.tree]),
      version: currentTree.version + 1,
      updatedAt: new Date().toISOString()
    };

    if (!nodeToMove) {
      throw new Error('Node to move not found');
    }

    // 新しい位置にノードを追加
    const addToNewPosition = (nodes: TreeNode[]): boolean => {
      if (!newParentId) {
        if (typeof index === 'number') {
          updatedTree.tree.splice(index, 0, nodeToMove!);
        } else {
          updatedTree.tree.push(nodeToMove!);
        }
        return true;
      }

      for (const node of nodes) {
        if (node.id === newParentId) {
          if (typeof index === 'number') {
            node.children.splice(index, 0, nodeToMove!);
          } else {
            node.children.push(nodeToMove!);
          }
          return true;
        }
        if (node.children.length > 0 && addToNewPosition(node.children)) {
          return true;
        }
      }
      return false;
    };

    if (!addToNewPosition(updatedTree.tree)) {
      throw new Error('New parent node not found');
    }

    return updatedTree;
  },

  // 指定したノードの配下にある全てのノードのIDを取得（自身も含む）
  getSubtreeIds(id: string, currentTree: TreeStructure): string[] {
    const ids: string[] = [];

    const collectIds = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.id === id) {
          ids.push(id);
          node.children.forEach(child => collectIds([child]));
          return true;
        }
        if (node.children.length > 0 && collectIds(node.children)) {
          return true;
        }
      }
      return false;
    };

    collectIds(currentTree.tree);
    return ids;
  },
};