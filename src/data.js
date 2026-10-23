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
    displayName: 'Whitman House',
    category: 'COMMUNITY QUEST · CHECK-IN',
    description: 'Website check-in harian untuk komunitas Whitman House / The Main Ideas. Anggota mengirim screenshot sebagai bukti quest, memeriksa riwayat kehadiran, membuat sertifikat PNG, dan melihat leaderboard serta buku panduan.',
    liveUrl: 'https://whitmanhouse.vercel.app/',
    liveLabel: 'Buka Whitman House',
    previewImage: 'https://lh3.googleusercontent.com/d/1pY8QP0cfOvtFKGRmDkCY9alNk2rtFOn_=w1000',
    alt: 'Screenshot website Whitman House',
  },
  {
    id: 'nasib62',
    displayName: 'NASIB +62',
    category: 'STRATEGY BOARD GAME',
    description: 'Board game ekonomi satir tentang uang, tanah, dan kejutan hidup sehari-hari. Pemain membeli properti, membangun rumah, mengelola saldo, dan menghadapi bot dengan gaya strategi berbeda.',
    liveUrl: 'https://nasib62.vercel.app/',
    liveLabel: 'Mainkan NASIB +62',
    previewImage: 'https://lh3.googleusercontent.com/d/1D-qLFhHv_x4--bYA3p_TpyBpAoSbHvyg=w1000',
    alt: 'Screenshot permainan NASIB +62',
  },
  {
    id: 'libris',
    displayName: 'Libris',
    category: 'EBOOK READER',
    description: 'Aplikasi pembaca ebook untuk mengelola banyak berkas buku dan melanjutkan membaca dari posisi terakhir yang tersimpan. Fokus pengalaman membacanya mencakup perpindahan halaman, scroll vertikal, dan swipe horizontal agar tidak perlu mencari halaman dari awal lagi.',
    liveUrl: 'https://libris.vercel.app/',
    liveLabel: 'Buka Libris',
    previewImage: 'https://lh3.googleusercontent.com/d/1IXrFzd-mw_4aEvlR3nb-TOy8vxEld51k=w1000',
    alt: 'Screenshot aplikasi pembaca ebook Libris',
  },
  {
    id: 'notecanvas',
    displayName: 'NoteCanvas',
    category: 'PDF ANNOTATION · STUDY',
    description: 'Notebook digital untuk belajar langsung di materi PDF. Arah pengembangannya menekankan coretan dan anotasi pada halaman dokumen, pengaturan halaman, zoom, serta navigasi vertikal dan geser horizontal agar catatan nyaman dipakai di tablet maupun laptop.',
    liveUrl: 'https://notecanvas-studio.vercel.app/',
    liveLabel: 'Buka NoteCanvas',
    previewImage: 'https://lh3.googleusercontent.com/d/1T-A3uzCDrSmJdf4xmlUAJBeQARWk3Evk=w1000',
    alt: 'Screenshot aplikasi NoteCanvas untuk mencoret PDF',
  },
  {
    id: 'studywithmbah',
    displayName: 'StudyWithMbah',
    category: 'LEARNING COMMUNITY',
    description: 'Website komunitas belajar yang mengumpulkan materi, video, tautan latihan, dan bank soal PDF per topik. Proyek ini juga mengeksplorasi maskot interaktif dan animasi untuk membuat kegiatan belajar terasa lebih hidup.',
    liveUrl: 'https://studywithmbahcommunity.vercel.app/',
    liveLabel: 'Kunjungi komunitas',
    previewImage: 'https://lh3.googleusercontent.com/d/1cV5sOrL5kCOddKvaA4bhYiIlEc9AtTQ-=w1000',
    alt: 'Screenshot website komunitas belajar StudyWithMbah',
  },
  {
    id: 'essay',
    displayName: 'Simulasi Nulis Esai',
    category: 'ESSAY PRACTICE',
    description: 'Workspace latihan menulis esai dengan simulasi ujian, paket soal, histori jawaban, dan evaluasi akhir. AI Essay Coach dirancang memberi umpan balik pada tulisan; fitur AI live bergantung pada konfigurasi layanan, dengan evaluasi lokal sebagai fallback.',
    liveUrl: 'https://tryoutessaypartho.vercel.app/',
    liveLabel: 'Coba simulasi esai',
    previewImage: 'https://lh3.googleusercontent.com/d/1GMTSJxv0J91HUpMIYxnMcQXwj0tWfDPt=w1000',
    alt: 'Screenshot aplikasi simulasi menulis esai',
  },
  {
    id: 'latveria',
    displayName: 'Latveria Academy',
    category: 'UTBK · SNBT LEARNING',
    description: 'Eksperimen platform latihan UTBK-SNBT berbahasa Indonesia. Alur belajarnya mencakup katalog paket, pengerjaan soal, riwayat hasil dan EXP, tryout lintas subtes, serta mode battle ketika layanan backend dan datanya tersedia.',
    liveUrl: 'https://latveria-riiddev-web.vercel.app/',
    liveLabel: 'Buka Latveria Academy',
    previewImage: 'https://lh3.googleusercontent.com/d/1vnhdibEaDWeHRIPvsRVKhTcZGuPcHcKo=w1000',
    alt: 'Screenshot platform belajar Latveria Academy',
  },
];
