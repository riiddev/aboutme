export const PORTRAIT_SRC = null; // e.g. '/portrait.png' replaces the built-in sprite
export const GITHUB = 'https://github.com/riiddev';
export const SPOTIFY = 'https://open.spotify.com/playlist/5Qn9lmfjJ6KMuYl0jTIbkO?si=37d517eaa993488c';

export const NAV = [
  ['about', 'About'],
  ['projects', 'Projects'],
  ['skills', 'Toolbox'],
  ['activity', 'Activity'],
  ['contact', 'Contact'],
];

export const PALETTE = {
  K: '#152338', // hair / deep outline
  S: '#e4c5bd', // warm skin highlight
  s: '#b98790', // skin shadow
  Y: '#091321', // eyes
  E: '#091321',
  M: '#8c718f', // muted periwinkle shadow
  W: '#eaf7ff',
  G: '#8faec9',
  N: '#294d87', // jacket blue
  n: '#172b53',
  B: '#9cbdf7', // ice-lavender accent
  b: '#6f8fc8',
  X: '#101a2b',
  H: '#f7fcff',
};

// Pixel sprite. Eye pixels are rendered separately so they can blink and look around.
const F = 'SSSSSSSSSSSSSS';
export const SPRITE = [
  '........KKKKKKKK........',
  '......KKKKKKKKKKKK......',
  '.....KKKKKKKKKKKKKK.....',
  '.....KKKKKKKKKKKKKK.....',
  '.....KK' + 'SSSSSSSSSS' + 'KK.....',
  '.....K' + 'SSSSSSSSSSSS' + 'K.....',
  '.....' + 'SSEEESSSSEEESS' + '.....',
  '.....' + 'SSSYYSSSSYYSSS' + '.....',
  '....S' + 'SSSYYSSSSYYSSS' + 'S....',
  '...WS' + 'SSSSSSsSSSSSSS' + 'SW...',
  '...GS' + 'SSSSSMMMMSSSSS' + 'SG...',
  '...G.' + F + '.G...',
  '...G..' + 'sSSSSSSSSSSs' + '..G...',
  '...G.....' + 'sSSSSs' + '.....G...',
  '....' + 'NNNNN' + 'WWWWWW' + 'NNNNN' + '....',
  '....' + 'NNNGNWWWWWWNGNNN' + '....',
  '....' + 'NNNNGWWWWWWGNNNN' + '....',
  '....' + 'NNNNNGWWWWGNNNNN' + '....',
  '....' + 'NNNNNNGWWGNNNNNN' + '....',
  '....' + 'NNNNNNNGGNNNNNNN' + '....',
  '....' + 'NNNNNNWGWWNNNNNN' + '....',
  '....' + 'NNnNNNWGWWNNNnNN' + '....',
  '...' + 'NNnNNNNWGWWNNNNnNN' + '...',
  '...' + 'NNnNNNNWGWWNNNNnNN' + '...',
  '...' + 'NNnNNNNWGWWNNNNnNN' + '...',
  '...' + 'NNnNNNNBGBBNNNNnNN' + '...',
  '...' + 'NNnSSNNBGBBNNSSnNN' + '...',
  '...' + 'NNNNNNNBGBBNNNNNNN' + '...',
  '....' + 'BBBBBBBGBBBBBBBB' + '....',
  '....' + 'BBBBBBBBGGGGBBBB' + '....',
  '....' + 'BBBBBBBBBBBBGBBB' + '....',
  '....' + 'BBBBBBBbbBBBBBBB' + '....',
  ...Array(6).fill('.....' + 'BBBBBb' + '..' + 'bBBBBB' + '.....'),
  '...' + 'XXXWWXXX' + '..' + 'XXXWWXXX' + '...',
  '...' + 'HHHHHHHH' + '..' + 'HHHHHHHH' + '...',
];

export const CHEST_PALETTE = {
  o: '#091321',
  w: '#1b3552',
  l: '#315a7a',
  g: '#8298eb',
  y: '#9be8ff',
};

export const CHEST = [
  '..oooooooo..',
  '.owwwwwwwwo.',
  'owllllllllwo',
  'owwwwwwwwwwo',
  'oggggggggggo',
  'owwwwyywwwwo',
  'owwwwyywwwwo',
  'owwwwwwwwwwo',
  'owwwwwwwwwwo',
  'oooooooooooo',
];

export const NOTE = ['..##.', '..#.#', '..#..', '..#..', '###..', '###..'];

export const LINES = [
  "Hi, I'm Riiddev.",
  'Not an expert. Just curious.',
  'Frontend now, backend next.',
  'Build, break, repeat.',
];

export const MOOD_LINES = {
  about: "That's me, learning one step at a time.",
  projects: 'Pick a project. I will show you what is inside.',
  skills: "Tools I've been learning by building things.",
  activity: 'Little blocks of progress, one commit at a time.',
  contact: 'Find me on GitHub, Instagram, or Spotify.',
  music: 'Earbuds in. Blue hour on repeat.',
};

export const SIGNS = [
  ['Frontend & UI', 'Layout, typography, responsive design, interaction details, and motion that feels intentional.'],
  ['Backend basics', 'Learning how apps handle data, connect services, and work behind the interface.'],
  ['Build, break, repeat', 'Trying ideas in projects, finding what breaks, and improving them as I learn.'],
  ['Pixel & motion', 'Into expressive interfaces, playful motion, and small details that give a project personality.'],
];

export const LANGS = [
  ['html', 'HTML'],
  ['css', 'CSS'],
  ['javascript', 'JavaScript'],
  ['typescript', 'TypeScript'],
  ['appsScript', 'Google Apps Script'],
];

export const TOOLS = [
  ['react', 'React'],
  ['vite', 'Vite'],
  ['gsap', 'GSAP'],
  ['remotion', 'Remotion'],
  ['git', 'Git'],
  ['github', 'GitHub'],
];

// Projects shown in the portfolio. Links intentionally point to the live product, never source repositories.
export const PROJECTS = [
  {
    id: 'whitman',
    featured: true,
    displayName: 'Whitman House',
    category: 'COMMUNITY QUEST · CHECK-IN',
    description: 'A daily check-in experience for the Whitman House / The Main Ideas community. Members submit screenshot proof, review attendance history, generate PNG certificates, and explore the leaderboard and guide.',
    liveUrl: 'https://whitmanhouse.vercel.app/',
    liveLabel: 'Open Whitman House',
    previewImage: 'https://lh3.googleusercontent.com/d/1pY8QP0cfOvtFKGRmDkCY9alNk2rtFOn_=w1000',
    alt: 'Screenshot of the Whitman House check-in website',
  },
  {
    id: 'nasib62',
    featured: true,
    displayName: 'NASIB +62',
    category: 'STRATEGY BOARD GAME',
    description: 'A satirical economy board game about money, property, and everyday surprises. Players buy lots, build houses, manage their balance, and face bots with different strategies.',
    liveUrl: 'https://nasib62.vercel.app/',
    liveLabel: 'Play NASIB +62',
    previewImage: 'https://lh3.googleusercontent.com/d/1D-qLFhHv_x4--bYA3p_TpyBpAoSbHvyg=w1000',
    alt: 'Screenshot of the NASIB +62 strategy board game',
  },
  {
    id: 'libris',
    featured: true,
    displayName: 'Libris',
    category: 'EBOOK READER',
    description: 'An ebook reader focused on picking up where you left off, with page navigation, vertical reading, and horizontal swipes for moving between pages.',
    liveUrl: 'https://libris.vercel.app/',
    liveLabel: 'Open Libris',
    previewImage: 'https://lh3.googleusercontent.com/d/1IXrFzd-mw_4aEvlR3nb-TOy8vxEld51k=w1000',
    alt: 'Screenshot of the Libris ebook reader',
  },
  {
    id: 'notecanvas',
    displayName: 'NoteCanvas',
    category: 'PDF ANNOTATION · STUDY',
    description: 'A study workspace for working directly on PDF material, with document annotations, page controls, zoom, and vertical or horizontal navigation for laptop and tablet use.',
    liveUrl: 'https://notecanvas-studio.vercel.app/',
    liveLabel: 'Open NoteCanvas',
    previewImage: 'https://lh3.googleusercontent.com/d/1T-A3uzCDrSmJdf4xmlUAJBeQARWk3Evk=w1000',
    alt: 'Screenshot of NoteCanvas PDF annotation tools',
  },
  {
    id: 'studywithmbah',
    displayName: 'StudyWithMbah',
    category: 'LEARNING COMMUNITY',
    description: 'A learning-community site that brings together topic-based materials, videos, practice links, and PDF question banks, with an interactive mascot and motion experiments.',
    liveUrl: 'https://studywithmbahcommunity.vercel.app/',
    liveLabel: 'Visit the community',
    previewImage: 'https://lh3.googleusercontent.com/d/1cV5sOrL5kCOddKvaA4bhYiIlEc9AtTQ-=w1000',
    alt: 'Screenshot of the StudyWithMbah learning community',
  },
  {
    id: 'essay',
    displayName: 'Simulasi Nulis Esai',
    category: 'ESSAY PRACTICE',
    description: 'An essay-practice workspace with exam simulations, question sets, answer history, and end-of-session feedback. Live AI coaching depends on service configuration; local evaluation is available as a fallback.',
    liveUrl: 'https://tryoutessaypartho.vercel.app/',
    liveLabel: 'Try essay practice',
    previewImage: 'https://lh3.googleusercontent.com/d/1GMTSJxv0J91HUpMIYxnMcQXwj0tWfDPt=w1000',
    alt: 'Screenshot of the essay practice workspace',
  },
  {
    id: 'latveria',
    displayName: 'Latveria Academy',
    category: 'UTBK · SNBT LEARNING',
    description: 'An ongoing UTBK-SNBT practice-platform experiment in Indonesian, exploring test packages, question sessions, result and EXP history, multi-subtest tryouts, and battle mode when backend services and data are available.',
    liveUrl: 'https://latveria-riiddev-web.vercel.app/',
    liveLabel: 'Open Latveria Academy',
    previewImage: 'https://lh3.googleusercontent.com/d/1vnhdibEaDWeHRIPvsRVKhTcZGuPcHcKo=w1000',
    alt: 'Screenshot of Latveria Academy',
  },
];
