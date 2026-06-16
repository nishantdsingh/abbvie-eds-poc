import { decorateBlock } from './carousel-video-playlist.js';

export default async function getBlockConfigs() {
  return {
    flags: {},
    variations: [],
    decorations: {
      decorate: async (ctx) => decorateBlock(ctx),
    },
  };
}
