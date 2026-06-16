export default async function getBlockConfigs() {
  return {
    flags: {
      showIcon: true,
      showRecaptchaNotice: true,
      showDisclaimer: true,
      submitIconEnabled: false,
      headingTag: 'h2',
      autoSubmitOnStateChange: true,
      errorDisplayMode: 'tooltip',
      disclaimerModal: false,
    },
    variations: [],
    decorations: {},
  };
}
