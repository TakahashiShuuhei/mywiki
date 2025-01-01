export const TREE_UPDATE_EVENT = 'tree-update';

export const triggerTreeUpdate = () => {
  const event = new CustomEvent(TREE_UPDATE_EVENT);
  window.dispatchEvent(event);
};