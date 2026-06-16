# AbbVie ADMP — Analytics Implementation Reference

> Source: `abbvieadmp-admp-ivy-09050b1737e8` AEM codebase  
> Purpose: Complete analytics reference for EDS migration  
> Date: 2026-05-19

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [window.digitalData — Page-Level Data Layer](#2-windowdigitaldata--page-level-data-layer)
3. [window.AbbViePageInfo — Global Config Object](#3-windowabbviepageinfo--global-config-object)
4. [data-digitaldata Attribute — Component Interaction Tracking](#4-data-digitaldata-attribute--component-interaction-tracking)
5. [Adobe Launch (DTM) Integration](#5-adobe-launch-dtm-integration)
6. [Analytics Dialog Fields — Authoring Model](#6-analytics-dialog-fields--authoring-model)
7. [MVA (Most Valued Action) System](#7-mva-most-valued-action-system)
8. [Use Case: CTA / Link Click Tracking](#8-use-case-cta--link-click-tracking)
9. [Use Case: Video Analytics (Brightcove)](#9-use-case-video-analytics-brightcove)
10. [Use Case: Video Analytics (YouTube)](#10-use-case-video-analytics-youtube)
11. [Use Case: Audio Player Analytics](#11-use-case-audio-player-analytics)
12. [Use Case: Form Analytics](#12-use-case-form-analytics)
13. [Use Case: Social Share Analytics](#13-use-case-social-share-analytics)
14. [Use Case: Navigation / Menu Tracking](#14-use-case-navigation--menu-tracking)
15. [Use Case: Modal Tracking](#15-use-case-modal-tracking)
16. [Use Case: Search Analytics](#16-use-case-search-analytics)
17. [Use Case: Accordion / Tabs / Carousel](#17-use-case-accordion--tabs--carousel)
18. [Use Case: User Profile / Identity](#18-use-case-user-profile--identity)
19. [Auto-Generated Interaction IDs](#19-auto-generated-interaction-ids)
20. [EDS Migration Strategy](#20-eds-migration-strategy)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  AEM Page Load                                                       │
│                                                                      │
│  head.html                                                           │
│    ├── analytics.html    → <script>var digitalData = {...}</script>  │
│    ├── customheaderlibs  → <script>window.AbbViePageInfo = {...}</script>│
│    └── <script src="Adobe Launch URL" async>                         │
│                                                                      │
│  Component Render                                                    │
│    └── Every interactive element → data-digitaldata='{...JSON...}'  │
│                                                                      │
│  User Interaction                                                    │
│    └── Click / scroll / video event                                  │
│         └── Adobe Launch reads data-digitaldata attribute            │
│              └── Fires Adobe Analytics beacon                        │
└─────────────────────────────────────────────────────────────────────┘
```

**Three layers work together:**

| Layer | What it is | When it fires |
|---|---|---|
| `window.digitalData` | Static page context (product, category, user profile) | On page load |
| `data-digitaldata` | Per-element interaction payload | On click / interaction |
| `_satellite.track()` | Explicit event call for media/forms | On specific events (play, pause, submit) |

**AEM Source files:**
- `analytics.html` → `apps/common-elements/v1/components/page/base-page/analytics.html`
- `customheaderlibs.html` → `apps/common-elements/v1/components/page/full-width-content-page/customheaderlibs.html`
- `analytics.js` → `etc/clientlibs/common-elements/clientlibs/framework/ui/analytics.js`
- Forms analytics → `apps/abbvieforms/v1/base/ui/js/admp_analytics.js`

---

## 2. window.digitalData — Page-Level Data Layer

Initialized inline in `<head>` before the Adobe Launch script loads. Every page sets these values from AEM page properties.

### Full Structure

```javascript
window.digitalData = {
  page: {

    // ── Page identity
    pageInfo: {
      domain:    'skyrizi.com',
      subDomain: 'www',
      url:       'https://www.skyrizi.com/plaque-psoriasis',
      path:      '/plaque-psoriasis',
      pageName:  'Skyrizi:Plaque Psoriasis:Home',   // colon-delimited hierarchy
      title:     'SKYRIZI® (risankizumab-rzaa) | Plaque Psoriasis',
      prefix:    'Skyrizi'                           // brand prefix
    },

    // ── Page taxonomy
    category: {
      primaryCategory: 'Plaque Psoriasis',
      subCategory1:    'Patient',
      subCategory2:    ''
    },

    // ── Page attributes
    attributes: {
      country:          'US',
      language:         'en',
      template:         'full-width-content-page',
      promoMatsNumber:  'US-RISA-210001',            // ePass regulatory number
      globalISI:        'true',                       // has ISI
      type:             'Product'                     // page type
    },

    // ── Content journey (indication-aware sites)
    journey: {
      content:       '',    // content journey stage
      patient:       '',    // patient journey stage
      messageBucket: ''     // message targeting bucket
    },

    // ── Product info
    product: {
      name:       'SKYRIZI',
      franchise:  'Immunology',
      indication: 'Plaque Psoriasis',
      division:   'AbbVie',
      brand:      'Skyrizi'
    },

    // ── Site classification
    site: {
      type:       'Brand',              // Brand | Disease Awareness | Corporate
      experience: 'DTC',               // DTC | HCP
      audience:   'Patient'            // Patient | HCP | Caregiver
    },

    // ── Modal state (populated at runtime by analytics.js)
    modal: {
      type:      '',
      name:      '',
      position:  '',
      enabled:   '',
      displayed: ''
    },

    // ── Search state (populated at runtime by search components)
    search: {
      autoPosition:   '',
      term:           '',
      count:          '',
      indication:     '',
      type:           '',
      filterType:     '',
      filterValue:    '',
      filterCategory: '',
      sortByInit:     '',
      origin:         '',
      originURL:      ''
    }
  },

  // ── User identity (populated at runtime from cookies)
  user: [{
    profile: [{
      id: {
        crmID:             '',   // from admp_crmid cookie
        transID:           '',   // transaction ID
        abbvieCustomerID:  '',   // abbvie customer ID
        hcpAccountID:      '',   // HCP account
        npiID:             '',   // NPI number
        dmpID:             '',   // from ac_uuid cookie (DMP)
        adobeID:           ''    // from ac_mcid cookie (ECID)
      },
      attributes: {
        status: '',   // authenticated | anonymous
        type:   ''    // patient | hcp | caregiver
      }
    }]
  }]
};
```

### Page Properties → digitalData Mapping

| `digitalData` field | AEM Page Property | Notes |
|---|---|---|
| `pageInfo.pageName` | Hierarchy: `{prefix}:{primaryCategory}:{pageName}` | Colon-delimited, built server-side |
| `pageInfo.prefix` | `analyticsPrefix` (inherited) | Brand name prefix |
| `category.primaryCategory` | `primaryCategory` | Page taxonomy |
| `attributes.promoMatsNumber` | `epassNumber` | Required regulatory field |
| `attributes.globalISI` | `globalisi` | Whether ISI is present |
| `product.name` | `productName` (inherited from site root) | |
| `product.franchise` | `franchise` (inherited) | e.g. Immunology, Oncology |
| `product.indication` | `indication` (inherited) | |
| `site.experience` | `siteType` (HCP vs consumer) | Drives which Launch property loads |
| `journey.*` | `contentJourney`, `patientJourney`, `messageBucket` | Indication-aware sites |

---

## 3. window.AbbViePageInfo — Global Config Object

Also injected in `<head>`, after `digitalData`. Contains page-specific config consumed by component JS.

```javascript
window.AbbViePageInfo = {

  // ── Auth / page state
  loginPage:       '/content/skyrizi/en-us/login',
  forcedLogin:     'false',
  editState:       'false',                    // true in AEM author mode
  pagepath:        '/content/skyrizi/en-us/home',
  adminConfigPath: '/content/admin/skyrizi/en-us',

  // ── Campaign Manager API endpoints (from ce-api-endpoints admin config)
  apiEndPoints: {
    getAssessment:           '/api/BrandAPIGateway/api/Assessment/Get',
    saveAssessment:          '/api/BrandAPIGateway/api/Assessment/Save',
    getAggregated:           '/api/BrandAPIGateway/api/Assessment/GetAggregated',
    physicianLookUp:         '/api/BrandAPIGateway/api/Physician/LookUp',
    getPatientFullfilment:   '/api/BrandAPIGateway/api/V2/PatientFulfillment/GetPatientFulfillment',
    refreshToken:            '/bin/abbvieforms/refreshlogin',
    getSearchSuggestions:    '/suggest',
    getSearchResults:        '/search',
    apigeePhysicianLookUp:   '/bin/abbvie/apiproxy',
    apigeeProviderLookUp:    '/bin/abbvie/providerlookupapiproxy',
    infusionSiteLocator:     '/bin/abbvie/providerlookupapiproxy'
  },

  // ── Social share config (per-page, from Page Properties → ADMP Social Share tab)
  share: {
    copy:      { text: 'Link copied!', showSuccess: true,  enable: true  },
    email:     { modalID: 'share-email-modal',             enable: true  },
    facebook:  { url: 'https://www.facebook.com/sharer/sharer.php?u=',   enable: true  },
    twitter:   { url: 'https://www.twitter.com/share?url=',              enable: false },
    linkedin:  { url: 'https://www.linkedin.com/shareArticle?mini=true&url=', enable: false },
    tumblr:    { url: 'https://www.tumblr.com/widgets/share/tool?canonicalUrl=', enable: false },
    pinterest: { url: 'https://pinterest.com/pin/create/button/?url=',   enable: false },
    instagram: { url: 'https://instagram.com/share?url=',                enable: false },
    exitModal: { modalID: 'exit-disclaimer-modal' }
  },

  // ── Indication-aware URL templates (multi-indication sites)
  indicationEndPoints: {
    header:    '/content/skyrizi/en-us/{{indication}}/jcr:content/headerIpar.html',
    footer:    '/content/skyrizi/en-us/{{indication}}/jcr:content/footerIpar.html',
    safetyBar: '/content/skyrizi/en-us/{{indication}}/jcr:content/safetybar.html',
    inlineUse: '<safetyFolderPath>/{{indication}}/use/jcr:content/contentpar.html',
    inlineISI: '<safetyFolderPath>/{{indication}}/isi/jcr:content/contentpar.html'
  },
  indicationName:  'plaque-psoriasis',
  indicationReset: 'false',
  epassNumber:     'US-RISA-210001',
  indicationAware: 'true',

  // ── Coveo search config
  coveoSearchHub:                  'SkyrziSearchHub',
  coveoSearchUrl:                  'https://platform.cloud.coveo.com',
  coveoOrganizationId:             'abbvieproduction',
  coveoHostedSearchPageAPIKey:     'xxxx-xxxx-xxxx',
  coveoQuerySuggestionsEnabled:    'true',

  // ── reCAPTCHA
  admpInvisibleEntRecaptchaSitekey: '6Lc...',

  // ── Friendly names: URL hash → Brightcove video ID mapping
  friendlyNames: {
    'moa-video':    '1234567890',
    'patient-story':'0987654321'
  },

  // ── Page audience
  pageAudienceType: 'patient',         // patient | hcp | caregiver

  // ── Header/footer/ISI inheritance flags
  headerInheritance:   'true',
  footerInheritance:   'true',
  safetybarInheritance:'true',

  // ── Other
  brandConfig:     '{}',
  campaignConfig:  '{}',
  runModes:        'publish',
  maxComponentCount: '50',
  globalFooterLinks:  '...'
};
```

---

## 4. data-digitaldata Attribute — Component Interaction Tracking

Every interactive element renders a `data-digitaldata` attribute containing a JSON payload. Adobe Launch reads this on click events.

### Full JSON Schema

```json
{
  "digitalData": {
    "page": {
      "link": {
        "name":         "Download Savings Card",
        "displayTitle": "Download Savings Card",
        "type":         "download",
        "url":          "https://www.skyrizi.com/savings-card.pdf"
      },
      "menu": {
        "location": "",
        "level":    "",
        "label":    "",
        "path":     ""
      },
      "component": {
        "type":     "Content",
        "l10title": "",
        "title":    "Savings Section",
        "name":     "CTA",
        "position": "Content"
      },
      "content": {
        "type":  "PDF",
        "title": "Savings Card",
        "name":  "savings-card"
      },
      "interaction": {
        "type": "content download",
        "name": "Download Savings Card",
        "id":   "abbv-cta-a1b2c3d4",
        "tags": ""
      },
      "mva": {
        "name":     "Savings Card Download",
        "tier":     "primary",
        "type":     "Download",
        "category": "Savings Card"
      }
    }
  }
}
```

### Field Definitions

#### `link` object

| Field | Values | How determined |
|---|---|---|
| `name` | Human-readable link name | `analyticsTitle` authored field, fallback to link text |
| `displayTitle` | Same as name | Duplicate for display purposes |
| `type` | `internal` \| `external` \| `download` | Auto-detected from URL: external domain → `external`; `.pdf/.doc/.xls/...` extension → `download`; same domain → `internal` |
| `url` | Full URL of the link | |

#### `component` object

| Field | Values | How determined |
|---|---|---|
| `type` | `Content` \| `Navigation` \| `Footer` \| `Modal` \| `Header` | Position in page DOM hierarchy |
| `l10title` | Localized section title | `l10Title` authored field (non-English sites only) |
| `title` | Section title | `sectionTitle` authored field |
| `name` | Component type name | e.g. `"CTA"`, `"Accordion"`, `"Video Player"`, `"Social Share"` |
| `position` | `Content` \| `Navigation` \| `Footer` \| `Header` | Auto-derived from resource path |

#### `interaction` object

| Field | Values | How determined |
|---|---|---|
| `type` | `""` for CTAs; `"content share"` for social; `"tool interaction"` for tools | Component-specific |
| `name` | Interaction label | `analyticsTitle` authored field |
| `id` | Unique interaction ID | Auto-generated `abbv-{component}-{uuid}`, stored in JCR |
| `tags` | Third-party tags string | `thirdPartyTags` authored field (optional) |

#### `mva` object (only present when MVA checkbox is checked in dialog)

| Field | Values |
|---|---|
| `name` | `mvaTitle` authored field |
| `tier` | `"primary"` (default) or `"secondary"` (if MVA Secondary checkbox checked) |
| `type` | Left side of `mvaTypeAndCategory` value (e.g. `"Download"` from `"Download\|Savings Card"`) |
| `category` | Right side of `mvaTypeAndCategory` value (e.g. `"Savings Card"`) |

### Components that Output `data-digitaldata`

| Component | Element | Notes |
|---|---|---|
| CTA | `<a>` | Every link variant |
| Anchor Tag | `<a>` | All 6 anchor variants (standard, CTA, span, utility-nav, footer, menu-item) |
| Footer | `<a>` links | All footer nav links |
| Primary Navigation | `<a>` links | Nav items and mega-menu CTAs |
| Accordion | `<button>` headers | Per-accordion-item |
| Tabs | `<button>` tab headers | Per-tab |
| Carousel | `<a>` CTA links | Per-slide CTA |
| Modal | `<a>` CTA links | Inside modal content |
| Tooltip | Trigger element | |
| Video Player (Brightcove) | `.abbv-video-player` div | Analytics object for video |
| YouTube | `.abbv-youtube-player` div | |
| Audio Player | Player element | |
| Social Share | `<button>` per network | Per-network analytics payload |
| Hot Spot | Hotspot trigger | |
| Image Compare Slider | Slider element | |
| Safety Bar | Links inside ISI | |
| Container | CTA links | |
| Activity Tracker | Interactive elements | |

---

## 5. Adobe Launch (DTM) Integration

### Launch Script URLs

| Environment | Consumer / DTC | HCP |
|---|---|---|
| Dev / Stage | `https://assets.adobedtm.com/acb96670c057/48663f28f53f/launch-e24016a2c101-development.min.js` | `https://assets.adobedtm.com/acb96670c057/9c3082d42795/launch-144d36e99160-development.min.js` |
| Production | `https://assets.adobedtm.com/acb96670c057/48663f28f53f/launch-450e00021d4f.min.js` | `https://assets.adobedtm.com/acb96670c057/9c3082d42795/launch-ad0de6ed4e51.min.js` |

- **DTM Org ID:** `acb96670c057`
- **Consumer Property ID:** `48663f28f53f`
- **HCP Property ID:** `9c3082d42795`

### Load Strategy

```html
<!-- Default: async in <head> -->
<script src="https://assets.adobedtm.com/.../launch-xxx.min.js" async></script>

<!-- Optional: deferred in footer (loadLaunchJsInFooter = true) -->
<script src="https://assets.adobedtm.com/.../launch-xxx.min.js" defer></script>
```

### How Adobe Launch Consumes the Data Layer

Launch rules in the Adobe Launch UI (not in the codebase) listen for:
1. **Page Load** → reads entire `window.digitalData` object
2. **Click events on `[data-digitaldata]` elements** → parses the attribute JSON → sends to Adobe Analytics
3. **`_satellite.track()` calls** → for explicit event tracking (video, audio, forms)

### `_satellite.track()` Event Taxonomy

| Event Name | Fired by | Use Case |
|---|---|---|
| `'trackAction'` | Forms JS (`admp_analytics.js`) | All form interactions |
| `'video_start'` | YouTube JS | Video first play |
| `'video_resume'` | YouTube JS | Video resume after pause |
| `'video_pause'` | YouTube JS | Video pause |
| `'video_end'` | YouTube JS | Video completion |
| `'video_25'` | YouTube JS | 25% milestone |
| `'video_50'` | YouTube JS | 50% milestone |
| `'video_75'` | YouTube JS | 75% milestone |
| `'video_90'` | YouTube JS | 90% milestone |
| `'audio_play'` | Audio Player JS | Audio play |
| `'audio_pause'` | Audio Player JS | Audio pause |
| `'audio_ended'` | Audio Player JS | Audio completion |
| `'audio_25/50/75/90'` | Audio Player JS | Milestone events |

**Note:** Brightcove does NOT use `_satellite.track()`. Instead it updates `digitalData.page.video` and Launch fires based on data layer change rules.

---

## 6. Analytics Dialog Fields — Authoring Model

Every interactive component has an **Analytics tab** in its AEM dialog with these fields:

### Standard Fields (present on all components)

| Dialog Field | JCR Property | Purpose |
|---|---|---|
| Analytics Interaction ID | `interactionId` | Auto-generated unique ID (read-only, auto-populated by Sling Model) |
| Analytics Title | `analyticsTitle` | Populates `link.name`, `link.displayTitle`, `interaction.name` |
| Section Title for Analytics | `sectionTitle` | Populates `component.title` |
| Localized Section Title | `l10Title` | Populates `component.l10title` (non-English only) |
| Most Valued Action (MVA) | `mvaPrimary` | Checkbox — includes MVA object in payload |
| MVA Title | `mvaTitle` | Populates `mva.name` |
| MVA Type and Category | `mvaTypeAndCategory` | Dropdown → `"Type\|Category"` string |
| MVA Secondary | `mvaSecondary` | Checkbox — sets `mva.tier = "secondary"` |

### Additional Fields (CTA only)

| Dialog Field | JCR Property | Purpose |
|---|---|---|
| Third Party Tags | `thirdPartyTags` | Populates `interaction.tags` (for third-party analytics) |

### Components with Analytics Tabs

| Component | Has Analytics Tab |
|---|---|
| CTA | Yes (full) |
| Accordion | Yes |
| Tabs | Yes |
| Carousel | Yes |
| Video Player | Yes |
| YouTube | Yes |
| Audio Player | Yes |
| Social Share | Yes |
| Footer | Yes |
| Primary Navigation | Yes |
| Section Navigation | Yes |
| Modal | Yes |
| Tooltip | Yes |
| Hot Spot | Yes |
| Chart (Bar/Line/Pie) | Yes |
| Activity Tracker | Yes |
| Safety Bar | Yes |
| Promo Drawer | Yes |
| Info Tree | Yes |
| Quick Poll | Yes |
| Image Compare Slider | Yes |
| Container | Yes |
| Find a Provider | Yes |
| Formulary Lookup | Yes |
| Header Logo | Yes |

---

## 7. MVA (Most Valued Action) System

MVA tracks the highest-value user interactions — downloads, form submissions, video views of key content.

### Admin List Location
`/content/admin/common-elements/en-us/ce-mva-value/`  
Value format: `"Type|Category"` (pipe-delimited)

### Complete MVA Type + Category Reference

| Type | Categories |
|---|---|
| **Call** | Cost Info, More Info |
| **Download** | Assessment Guide, Complete Enrollment Form, Condition Information, Doctor Discussion Guide, Dosing Information, Flashcard, Formulary Toolkit, ICD-10 Codes, Injection Training, Medical Exception, Pain Scale, Patient Counseling Guide, Patient Discussion Guide, Patient Info Management, Patient Interviewing Guide, Patient Resources, Post-Treatment Guide, Prescribing Information, Prescription Form, Savings Card, Symptom Journal, Test Score Tracker, Treatment Guide |
| **Form** | Contact Rep, Doctor Discussion Guide, Doctor Search, Dosage Calculator, Enroll, Event Registration, Med Reminders, Profile Update, Quick Poll, Resource Request, Savings Card, Symptom Quiz, UGC Submission |
| **Link** | App Store, More Info, Product Information, Social Share |
| **Share** | Share Information, Share Results, Submit a Story |
| **Tool** | Assessment Tool, Benefits Verification, Carousel, Formulary Tool, Initiation, Medical Exception, Myth versus Fact, Q And A, Slider, Workaround Quiz |
| **Video** | Administration Instructions, Condition Information, Injection Training, Insurance, Inventory, Mechanism of Action, Other, Patient Story, Product Overview, Program Overview, Training |

### MVA Tier Logic

```
mvaPrimary checkbox = checked   → mva.tier = "primary"   (default)
mvaSecondary checkbox = checked → mva.tier = "secondary"
Neither checked                 → mva object omitted from data-digitaldata
```

### Brightcove Video MVA Override

Brand teams can override AEM-authored MVA values directly in Brightcove by adding tags to the video:
```
mva=primary:kol               → tier=primary, type=kol
videoname=connecting the dots → overrides analytics video name
```

---

## 8. Use Case: CTA / Link Click Tracking

### Flow

```
1. Author fills CTA dialog (Analytics tab)
2. CtaModel.java → setAnalyticsValues() → builds data-digitaldata JSON
3. HTML renders: <a href="..." data-digitaldata='{"digitalData":{...}}'> 
4. User clicks
5. Adobe Launch click rule fires → reads data-digitaldata → sends to AA
```

### `data-digitaldata` per link type

**Internal CTA:**
```json
{
  "digitalData": { "page": {
    "link":        { "name": "Learn More", "displayTitle": "Learn More", "type": "internal", "url": "/treatment-options" },
    "component":   { "type": "Content", "title": "Efficacy Section", "name": "CTA", "position": "Content" },
    "interaction": { "type": "", "name": "Learn More", "id": "abbv-cta-abc123" }
  }}
}
```

**External CTA (with exit modal):**
```json
{
  "digitalData": { "page": {
    "link":        { "name": "Visit AbbVie.com", "type": "external", "url": "https://www.abbvie.com" },
    "interaction": { "type": "", "name": "Visit AbbVie.com", "id": "abbv-cta-xyz789" }
  }}
}
```

**Download CTA (with MVA):**
```json
{
  "digitalData": { "page": {
    "link":        { "name": "Download Savings Card", "type": "download", "url": "https://.../savings-card.pdf" },
    "interaction": { "type": "content download", "name": "Download Savings Card", "id": "abbv-cta-def456" },
    "mva":         { "name": "Savings Card Download", "tier": "primary", "type": "Download", "category": "Savings Card" }
  }}
}
```

### Link Type Auto-Detection Rules

```javascript
// From CommonUtility.getAnalyticsLinkType()
if (file extensions: .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .zip)  → "download"
if (domain !== current page domain)                                         → "external"
else                                                                        → "internal"
```

---

## 9. Use Case: Video Analytics (Brightcove)

### Data Layer Object: `digitalData.page.video`

```javascript
digitalData.page.video = {
  id:           '1234567890',           // Brightcove video ID
  length:       245.50,                 // total duration (seconds, 2dp)
  player:       'Brightcove Video Player',
  type:         'single',               // 'single' | 'playlist'
  name:         'MOA Video',            // authored name or BC mediainfo.name
  action:       'Playing',              // see actions below
  milestone:    '25%',                  // percentage reached
  playback:     '61.25',               // seconds elapsed
  chapter:      '',                     // chapter name (if chapters enabled)
  chapterRange: '00:01:00 - 00:02:15'  // chapter time range
}
```

### Events and Actions

| Player Event | `video.action` | Notes |
|---|---|---|
| First play | `"Playing"` | milestone = `"0%"` |
| Resume after pause | `"resume"` | |
| Pause | `"paused"` | |
| End | `"ended"` | milestone = `"100%"` |
| 25% reached | `"Playing"` | milestone = `"25%"` |
| 50% reached | `"Playing"` | milestone = `"50%"` |
| 75% reached | `"Playing"` | milestone = `"75%"` |
| Chapter selection | `"Chapter Selection"` | |

**Important:** Brightcove updates `digitalData.page.video` directly. Adobe Launch fires based on **data layer change** rules — no explicit `_satellite.track()`.

### Social Share from Video

When a user shares a video via the social share button inside the video player:
```javascript
element.setAttribute('data-digitalData', JSON.stringify({
  digitalData: { page: {
    link:        { type: 'external', url: socialURL },
    interaction: { type: 'content share', socialChannel: 'Facebook', id: videoInteractionId }
  }}
}));
```

---

## 10. Use Case: Video Analytics (YouTube)

Unlike Brightcove, YouTube uses **explicit `_satellite.track()` calls.**

### Data Structure passed to `_satellite.track()`

```javascript
{
  digitalData: { page: {
    video: {
      id:        youtubeVideoId,
      name:      authoredVideoTitle,
      player:    'YouTube',
      type:      'single',
      action:    'Playing|paused|resume|ended',
      milestone: '25%',
      playback:  '45.0',
      length:    300
    },
    interaction: { id: interactionId },
    mva: { ... }   // only on first play (0% milestone)
  }}
}
```

### Milestone Tracking

```javascript
// Milestones fired at: 25%, 50%, 75%, 90%
_satellite.track('video_25', dataObject);
_satellite.track('video_50', dataObject);
_satellite.track('video_75', dataObject);
_satellite.track('video_90', dataObject);
```

**MVA rule:** MVA data is included only in `video_start` at the `0%` milestone. All subsequent milestone/pause/end events have MVA stripped.

---

## 11. Use Case: Audio Player Analytics

Pattern mirrors YouTube — explicit `_satellite.track()` calls.

### Data Structure

```javascript
// Set on digitalData before _satellite.track()
digitalData.page.audio = {
  action:    'Playing|paused|ended',
  length:    300,          // total duration
  playback:  '45.0',      // seconds elapsed
  milestone: '50%'
}
```

### Events

```javascript
_satellite.track('audio_play',   digitalData);
_satellite.track('audio_pause',  digitalData);
_satellite.track('audio_ended',  digitalData);
_satellite.track('audio_25',     digitalData);
_satellite.track('audio_50',     digitalData);
_satellite.track('audio_75',     digitalData);
_satellite.track('audio_90',     digitalData);
```

---

## 12. Use Case: Form Analytics

Form analytics run inside AEM Adaptive Forms (iframe context). All calls go through `window.parent.digitalData` and `window.parent._satellite`.

### `digitalData.page.form` Object

```javascript
window.parent.digitalData.page.form = {
  name:        'Savings Card Enrollment',   // from hidden .analyticsFormName field
  category:    'Forms',                     // from .analyticsCategory
  subCategory: 'Enrollment',               // from .analyticsSubCategory
  fieldName:   'firstName',               // current field being interacted with
  fieldValue:  'John',                    // current field value (PII-masked if configured)
  fieldValues: 'firstName=John|lastName=XXXXXXX|email=john@...', // pipe-delimited on submit
  stepName:    'init|fieldName|submit',
  time:        12.5,                       // seconds from first interaction to submit
  error:       'API Error: timeout',       // on failure
  errorCode:   '408'
}
```

### Form Analytics Events

| Event | `_satellite.track()` call | When |
|---|---|---|
| Form start | `_satellite.track('trackAction', payload)` | First field interaction |
| Field change | `_satellite.track('trackAction', payload)` | On `guideBridge.elementValueChanged` |
| Form submit success | `_satellite.track('trackAction', payload)` | `stepName: 'submit'` |
| Form submit error | `_satellite.track('trackAction', payload)` | API failure |

### PII Masking

Fields listed in the hidden `.analyticsPIIFieldNamesForMasking` input (comma-separated) have their values replaced with `"XXXXXXX"` before being included in `fieldValues`.

```
// analyticsPIIFieldNamesForMasking value:
"firstName,lastName,dateOfBirth,emailAddress,phoneNumber,zipCode"
```

### Form-Level Analytics Metadata Fields (hidden inputs in every form)

| Input Class | Value | Purpose |
|---|---|---|
| `.analyticsFormName` | e.g. `"Savings Card Enrollment"` | `form.name` |
| `.analyticsCategory` | e.g. `"Forms"` | `form.category` |
| `.analyticsSubCategory` | e.g. `"Enrollment"` | `form.subCategory` |
| `.analyticsContentType` | e.g. `"Form"` | Content type |
| `.analyticsMVAName` | e.g. `"Savings Card"` | `mva.name` |
| `.analyticsMVAType` | e.g. `"Form"` | `mva.type` |
| `.analyticsMVATier` | `"Tier1"` | `mva.tier` |
| `.analyticsMVACategory` | e.g. `"Savings Card"` | `mva.category` |
| `.analyticsPIIFieldNamesForMasking` | Comma-separated field names | PII masking list |
| `.formlevelqapairs` | `"formstart:Q1,A1\|submit:Q2,A2"` | QA pair tracking |

---

## 13. Use Case: Social Share Analytics

Each social share button carries its own `data-digitaldata` (pre-built by `SocialShareModel.java`):

```json
{
  "digitalData": { "page": {
    "link":        { "name": "Share on Facebook", "displayTitle": "Share on Facebook",
                     "type": "external", "url": "https://www.facebook.com/sharer/sharer.php?u=" },
    "component":   { "type": "Social Share", "title": "Social Share Section",
                     "name": "Social Share", "position": "Content" },
    "content":     { "type": "Page", "title": "Plaque Psoriasis Home", "name": "plaque-psoriasis" },
    "interaction": { "type": "content share", "socialChannel": "Facebook",
                     "name": "Share on Facebook", "id": "abbv-social-share-abc123" }
  }}
}
```

### `interaction.socialChannel` Values per Network

| Network | `socialChannel` |
|---|---|
| Copy to clipboard | `"Copy Link"` |
| Email | `"Email"` |
| Facebook | `"Facebook"` |
| Twitter/X | `"Twitter/X"` |
| LinkedIn | `"LinkedIn"` |
| Pinterest | `"Pinterest"` |
| Tumblr | `"Tumblr"` |
| Instagram | `"Instagram"` |

---

## 14. Use Case: Navigation / Menu Tracking

Navigation links use the `menu` sub-object in the `data-digitaldata` payload.

```json
{
  "digitalData": { "page": {
    "link":      { "name": "Treatment Options", "type": "internal", "url": "/treatment-options" },
    "menu":      { "location": "Header", "level": "1", "label": "Treatment Options", "path": "Treatment Options" },
    "component": { "type": "Navigation", "name": "Primary Navigation", "position": "Header" },
    "interaction": { "type": "", "name": "Treatment Options", "id": "abbv-primary-nav-xyz" }
  }}
}
```

### `menu.location` Values

| Location | When |
|---|---|
| `"Header"` | Primary navigation |
| `"Footer"` | Footer nav links |
| `"Utility"` | Utility navigation (top bar) |
| `"Section"` | Section/anchor navigation |
| `"Mega Menu"` | Mega menu sub-items |

### `menu.level` Values

`"1"` = top-level nav item, `"2"` = sub-menu item, `"3"` = tertiary item.

---

## 15. Use Case: Modal Tracking

### Page-level `digitalData.page.modal` (set when modal opens)

```javascript
digitalData.page.modal = {
  type:      'exit',      // 'exit' | 'safety' | 'content' | 'force'
  name:      'Exit Disclaimer',
  position:  'center',
  enabled:   'true',
  displayed: 'true'
}
```

**Force Modal on Load:** If page URL contains a hash matching a force-modal config, `abbvDigitalData.init()` → `modal()` sets these fields before Launch fires the page view event.

### Modal CTA Links

CTAs inside modal content carry standard `data-digitaldata` with `component.type = "Modal"` and `component.position = "Modal"`.

---

## 16. Use Case: Search Analytics

Search components (Coveo) populate `digitalData.page.search` at runtime:

```javascript
digitalData.page.search = {
  autoPosition:   '3',              // position of selected autocomplete suggestion
  term:           'plaque psoriasis dosing',
  count:          '47',             // number of results returned
  indication:     'Plaque Psoriasis',
  type:           'site',           // 'site' | 'hcp' | 'product'
  filterType:     'Content Type',
  filterValue:    'Videos',
  filterCategory: 'Media',
  sortByInit:     'Relevance',
  origin:         'Search Box',
  originURL:      '/search-results'
}
```

---

## 17. Use Case: Accordion / Tabs / Carousel

These components track expansion/tab selection/slide changes via `data-digitaldata` on the trigger elements.

### Accordion (per item)

```json
{
  "digitalData": { "page": {
    "link":        { "name": "What is SKYRIZI?", "type": "internal", "url": "#accordion-1" },
    "component":   { "type": "Content", "title": "FAQ Section", "name": "Accordion", "position": "Content" },
    "interaction": { "type": "accordion expand", "name": "What is SKYRIZI?", "id": "abbv-accordion-abc" }
  }}
}
```

### Tabs (per tab)

```json
{
  "digitalData": { "page": {
    "component":   { "name": "Tabs", "title": "Clinical Data" },
    "interaction": { "type": "tab selection", "name": "Efficacy", "id": "abbv-tabs-xyz" }
  }}
}
```

### Carousel (per slide CTA)

```json
{
  "digitalData": { "page": {
    "component":   { "name": "Carousel", "title": "Patient Stories" },
    "interaction": { "type": "carousel navigation", "name": "Patient Story 1", "id": "abbv-carousel-def" }
  }}
}
```

---

## 18. Use Case: User Profile / Identity

`abbvDigitalData.init()` in `analytics.js` runs on DOM ready and populates user identity from cookies:

```javascript
// Reads cookies:
// ac_uuid  → DMP segment ID (Audience Manager)
// ac_mcid  → Adobe Experience Cloud ID (ECID)
// admp_tpd → Encrypted third-party data (decrypted client-side)

digitalData.user[0].profile[0].id.dmpID   = getCookie('ac_uuid');
digitalData.user[0].profile[0].id.adobeID = getCookie('ac_mcid');

// admp_tpd cookie (encrypted) when decrypted contains:
// { status: 'authenticated', type: 'patient', crmID: '...', transID: '...' }
digitalData.user[0].profile[0].attributes.status = 'authenticated';
digitalData.user[0].profile[0].attributes.type   = 'patient';
```

### HCP Identity (Okta)

For HCP sites, after Okta login:
```javascript
digitalData.user[0].profile[0].id.hcpAccountID = oktaProfile.accountId;
digitalData.user[0].profile[0].id.npiID         = oktaProfile.npi;
digitalData.user[0].profile[0].attributes.status = 'authenticated';
digitalData.user[0].profile[0].attributes.type   = 'hcp';
```

---

## 19. Auto-Generated Interaction IDs

Every component instance gets a unique, persistent interaction ID written back to the JCR node on first author edit.

### ID Format

```
abbv-{component-type}-{8-char-hex}

Examples:
abbv-cta-a1b2c3d4
abbv-accordion-e5f6g7h8
abbv-video-player-i9j0k1l2
abbv-social-share-m3n4o5p6
abbv-quick-poll-q7r8s9t0
abbv-tabs-u1v2w3x4
abbv-carousel-y5z6a7b8
```

### Prefix per Component

| Component | ID Prefix |
|---|---|
| CTA | `abbv-cta` |
| Accordion | `abbv-accordion` |
| Tabs | `abbv-tabs` |
| Carousel | `abbv-carousel` |
| Video Player | `abbv-video-player` |
| YouTube | `abbv-youtube` |
| Audio Player | `abbv-audio-player` |
| Social Share | `abbv-social-share` |
| Modal | `abbv-modal` |
| Tooltip | `abbv-tooltip` |
| Hot Spot | `abbv-hot-spot` |
| Info Tree | `abbv-info-tree` |
| Quick Poll | `abbv-quick-poll` |
| Activity Tracker | `abbv-activity-tracker` |
| Section Nav | `abbv-section-nav` |
| Primary Nav item | `abbv-primary-nav` |
| Footer link | `abbv-footer` |

### Auto-Write Logic (Java)

```java
// In AbstractComponentModel.init()
if (!isPublish() && (interactionId == null || !interactionId.equals(getId()))) {
    ModifiableValueMap map = resource.adaptTo(ModifiableValueMap.class);
    map.put("interactionId", getId());
    resource.getResourceResolver().commit();
}
```

This means every new component instance gets its ID automatically the first time an author opens the page in the editor — no manual authoring required.

---

## 20. EDS Migration Strategy

### What needs to be replicated in EDS

| AEM Mechanism | EDS Equivalent |
|---|---|
| `analytics.html` inline script | `scripts/analytics.js` — called from `scripts.js` `loadPage()`, outputs same `window.digitalData` shape populated from EDS page metadata |
| `customheaderlibs.html` → `window.AbbViePageInfo` | `scripts/page-info.js` — builds same object from `ab-config.json` + page metadata |
| Adobe Launch script loading | Same `<script src="...">` tag in `<head>` via `scripts.js` `loadEager()` |
| `data-digitaldata` on links | Each block's `decorate()` function sets the attribute on all `<a>` elements |
| `_satellite.track()` for video/audio | Same call — Launch is already loaded |
| Auto interaction IDs | Generate in block JS using `crypto.randomUUID()`, store in block metadata or document |

### `window.digitalData` in EDS

```javascript
// scripts/analytics.js
import { getMetadata } from './aem.js';
import { getConfigValue } from './config.js';

export function initDigitalData() {
  const brand     = getMetadata('brand')     || await getConfigValue('brand');
  const franchise = getMetadata('franchise') || await getConfigValue('franchise');
  // ... read all page metadata

  window.digitalData = {
    page: {
      pageInfo: {
        domain:   window.location.hostname,
        url:      window.location.href,
        path:     window.location.pathname,
        pageName: buildPageName(),   // brand:category:pageName
        title:    document.title,
      },
      category:   { primaryCategory: getMetadata('primary-category'), ... },
      attributes: { promoMatsNumber: getMetadata('epass-number'), ... },
      product:    { name: brand, franchise, ... },
      site:       { type: 'Brand', experience: getMetadata('site-experience'), ... },
      modal:      { type: '', name: '', ... },
      search:     { term: '', count: '', ... }
    },
    user: [{ profile: [{ id: {}, attributes: {} }] }]
  };
}
```

### `data-digitaldata` helper in EDS blocks

```javascript
// scripts/analytics-utils.js

export function buildDigitalData({ linkName, linkType, linkUrl, componentName,
  sectionTitle, interactionType, interactionId, mva } = {}) {
  const dd = {
    digitalData: { page: {
      link:        { name: linkName, displayTitle: linkName, type: linkType, url: linkUrl },
      component:   { type: 'Content', title: sectionTitle || '', name: componentName, position: 'Content' },
      interaction: { type: interactionType || '', name: linkName, id: interactionId }
    }}
  };
  if (mva) dd.digitalData.page.mva = mva;
  return JSON.stringify(dd);
}

export function decorateAnalytics(block, config) {
  block.querySelectorAll('a[href]').forEach((a) => {
    const type = getLinkType(a.href);
    a.dataset.digitaldata = buildDigitalData({
      linkName:        a.textContent.trim(),
      linkType:        type,
      linkUrl:         a.href,
      componentName:   config.componentName,
      sectionTitle:    config.sectionTitle,
      interactionId:   config.interactionId,
      mva:             config.mva
    });
  });
}

function getLinkType(href) {
  if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip)(\?.*)?$/i.test(href)) return 'download';
  if (new URL(href).hostname !== window.location.hostname) return 'external';
  return 'internal';
}
```

### Page Metadata fields needed in EDS document

Add these columns to the EDS page document metadata table:

| Metadata Key | `digitalData` field | Example |
|---|---|---|
| `analytics-page-name` | `pageInfo.pageName` | `Skyrizi:Plaque Psoriasis:Home` |
| `analytics-prefix` | `pageInfo.prefix` | `Skyrizi` |
| `primary-category` | `category.primaryCategory` | `Plaque Psoriasis` |
| `epass-number` | `attributes.promoMatsNumber` | `US-RISA-210001` |
| `global-isi` | `attributes.globalISI` | `true` |
| `franchise` | `product.franchise` | `Immunology` |
| `indication` | `product.indication` | `Plaque Psoriasis` |
| `brand` | `product.name` | `SKYRIZI` |
| `site-experience` | `site.experience` | `DTC` |
| `audience-type` | `site.audience` | `Patient` |
| `content-journey` | `journey.content` | (optional) |
| `patient-journey` | `journey.patient` | (optional) |

### Block-Level Analytics authoring in EDS (`_block.json`)

Add these standard fields to every block's model that needs analytics:

```json
{
  "component": "tab",
  "label": "Analytics",
  "name": "analytics"
},
{
  "component": "text",
  "name": "analyticsTitle",
  "label": "Analytics Title"
},
{
  "component": "text",
  "name": "sectionTitle",
  "label": "Section Title for Analytics"
},
{
  "component": "text",
  "name": "l10Title",
  "label": "Localized Section Title (non-English only)"
},
{
  "component": "checkbox",
  "name": "mvaPrimary",
  "label": "Most Valued Action (MVA)"
},
{
  "component": "text",
  "name": "mvaTitle",
  "label": "MVA Title"
},
{
  "component": "select",
  "name": "mvaTypeAndCategory",
  "label": "MVA Type and Category",
  "options": [
    { "name": "Download | Savings Card",        "value": "Download|Savings Card" },
    { "name": "Download | Prescribing Information", "value": "Download|Prescribing Information" },
    { "name": "Form | Enroll",                  "value": "Form|Enroll" },
    { "name": "Form | Contact Rep",             "value": "Form|Contact Rep" },
    { "name": "Video | Mechanism of Action",    "value": "Video|Mechanism of Action" },
    { "name": "Video | Patient Story",          "value": "Video|Patient Story" }
  ]
},
{
  "component": "checkbox",
  "name": "mvaSecondary",
  "label": "MVA Secondary"
}
```

---

*End of document. All data sourced directly from `abbvieadmp-admp-ivy-09050b1737e8` AEM codebase.*
