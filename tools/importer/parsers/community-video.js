/* eslint-disable */
/* global WebImporter */

/**
 * Parser: community-video
 * Maps to existing 'brightcove-video' block
 * Selector: .abbv-video-player
 *
 * Known values from site analysis:
 * Account: 1029485116001, Player: Mcp9TXMkPT, Video: 6391878936112
 */
export default function parse(element, { document }) {
  // Extract video title from the heading nearby
  const titleEl = element.querySelector('h3') || element.querySelector('.heading-2');
  const title = titleEl ? titleEl.textContent.trim() : 'SEEKING THE RIGHT TREATMENT';

  // Try to extract player ID from class
  const playerClass = element.querySelector('[class*="bc-player-"]');
  let playerId = 'Mcp9TXMkPT';
  if (playerClass) {
    const match = playerClass.className.match(/bc-player-(\w+)_default/);
    if (match) playerId = match[1];
  }

  // Build brightcove-video block
  // The model has many fields - we provide the essential ones
  const cells = [
    [''],  // projectNumber
    [title],  // overlayTitle
    [''],  // overlayDescription
    [''],  // posterType
    [''],  // posterImage
    [''],  // posterAlt
    [''],  // colorOverlay
    [''],  // overlayButtonText
    [''],  // overlayButtonIconType
    [''],  // overlayButtonFontIcon
    [''],  // overlayButtonImageIcon
    [''],  // iconPosition
    [''],  // playerType
    ['1029485116001'],  // accountId
    [playerId],  // playerId
    ['6391878936112'],  // videoId
    [''],  // playlistId
    [''],  // defaultPlaylistVideoId
    [''],  // playlistType
    [''],  // videoContentLayout
    [''],  // playlistLayout
    [''],  // enablePlaylistThumbnailMetadata
    [''],  // enableAutoplay
    [''],  // enableLoop
    [''],  // enableCaptions
    [''],  // enableVideoChapters
    [''],  // enableRecommendedVideo
    [''],  // enablePlayerControls
    [''],  // enableSocialShare
    [''],  // enableTranscript
    [''],  // transcriptType
    [''],  // showTranscriptLabel
    [''],  // hideTranscriptLabel
    [''],  // transcriptClickBehavior
    [''],  // modalHiddenPanelId
    [''],  // transcriptLink
    [''],  // transcriptButtonIconType
    [''],  // transcriptShowFontIcon
    [''],  // transcriptShowImageIcon
    [''],  // transcriptHideFontIcon
    [''],  // transcriptHideImageIcon
    [''],  // transcriptLinkIconPosition
    [''],  // playButtonAriaLabel
    [''],  // videoCaption
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'brightcove-video', cells });
  element.replaceWith(block);
}
