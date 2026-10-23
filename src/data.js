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
  K: '#14141c',
  S: '#e4917a',
  s: '#c46f5c',
  Y: '#1b1218',
  E: '#1b1218',
  M: '#9b4638',
  W: '#f2f5fa',
  G: '#9aa6bd',
  N: '#2c2f63',
  n: '#1c1e46',
  B: '#e6d0a6',
  b: '#c4a97b',
  X: '#15151c',
  H: '#ffffff',
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
  o: '#1d130d',
  w: '#7a4f2d',
  l: '#a87443',
  g: '#BBA9FF',
  y: '#A9F06D',
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
  projects: 'Open a crate. Some are still being built.',
  skills: "Tools I've used in my projects.",
  activity: 'Pac-Man is eating my commits.',
  contact: 'Say hi on GitHub.',
  music: 'Earbuds in. Playlist on repeat.',
};

export const SIGNS = [
  ['Frontend & UI', 'Layout, typography, responsive design, interaction details, and motion that feels intentional.'],
  ['Backend basics', 'Learning how apps handle data, connect services, and work behind the interface.'],
  ['Build, break, repeat', 'Trying ideas in projects, finding what breaks, and improving them as I learn.'],
  ['Pixel & motion', 'Into expressive interfaces, playful motion, and small details that give a project personality.'],
];

export const LANGS = [
  ['HT', 'HTML'],
  ['CS', 'CSS'],
  ['JS', 'JavaScript'],
  ['TS', 'TypeScript'],
  ['AS', 'Google Apps Script'],
];

export const TOOLS = [
  ['RE', 'React'],
  ['VI', 'Vite'],
  ['GS', 'GSAP'],
  ['RM', 'Remotion'],
  ['GT', 'Git & GitHub'],
];

// Only entries already confirmed from the README/portfolio are hard-coded.
// Live GitHub data is merged into this list at runtime.
export const VERIFIED = [
  {
    name: 'riiddev',
    repoUrl: 'https://github.com/riiddev/riiddev',
    description: 'My GitHub profile README: a pixel-style intro, a ninja patrol animation, a Spotify player, a 3D contribution graph, and a Pac-Man contribution graph that GitHub Actions keeps updated.',
  },
  {
    name: 'portooo',
    live: 'https://riiddev.github.io/portooo/',
    description: 'My existing portfolio site.',
  },
];