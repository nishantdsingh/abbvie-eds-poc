export default async function getBlockConfigs() {
  return {
    flags: {
      submitIconEnabled: false,
      autoSubmitOnStateChange: false,
      disclaimerModal: true,
      errorDisplayMode: 'modal',
    },
    variations: [],
    decorations: {},
  };
}
