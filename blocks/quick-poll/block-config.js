import { decorateBlock } from './quick-poll.js';

export default async function getBlockConfigs() {
  return {
    flags: {},
    variations: [],
    decorations: {
      decorate: async (ctx) => decorateBlock(ctx),
    },
  };
}
