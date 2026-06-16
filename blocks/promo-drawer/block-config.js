import { decorateBlock } from './promo-drawer.js';

export default async function getBlockConfigs() {
  return {
    flags: {},
    variations: [],
    decorations: {
      decorate: async (ctx, blockConfig) => decorateBlock(ctx, blockConfig),
    },
  };
}
