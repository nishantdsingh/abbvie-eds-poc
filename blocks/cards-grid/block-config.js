import { decorateBlock } from './cards-grid.js';

export default async function getBlockConfigs() {
  return {
    decorations: {
      decorate: async (ctx) => decorateBlock(ctx),
    },
  };
}
