// import { beforeDecorate, decorateBlock, afterDecorate } from '../embed.js';

export default async function getBlockConfigs() {
  return {
    flags: {
      // flag: true,
    },
    variations: [
      // { variation: 'variation-name', module: 'variation.js' },
    ],
    decorations: {
    //   beforeDecorate: async (ctx, blockConfig) => beforeDecorate(ctx, blockConfig),
    //   decorate: async (ctx, blockConfig) => decorateBlock(ctx, blockConfig),
    //   afterDecorate: async (ctx, blockConfig) => afterDecorate(ctx, blockConfig),
    },
  };
}
