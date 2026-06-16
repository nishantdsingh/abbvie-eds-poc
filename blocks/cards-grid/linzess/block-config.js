import { decorateBlock } from '../cards-grid.js';
import brandDecorate from './cards-grid.js';

export default async function getBlockConfigs() {
  return {
    decorations: {
      decorate: async (ctx) => {
        if (!brandDecorate(ctx)) decorateBlock(ctx);
      },
    },
  };
}
