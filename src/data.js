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

// Curated summaries based on each public repository's README, so project panels explain what the project does.
export const PROJECT_DETAILS = {
  riiddev: {
    displayName: 'GitHub Profile README',
    category: 'PROFILE README',
    description: 'Profil GitHub bergaya pixel yang memperkenalkan Riiddev lewat ninja animasi, tautan playlist Spotify, grafik kontribusi 3D, dan Pac-Man yang berjalan di atas riwayat commit.',
  },
  portooo: {
    displayName: 'Portooo — previous portfolio',
    category: 'PORTFOLIO LAMA',
    description: 'Portofolio personal versi sebelumnya. Disimpan sebagai arsip untuk membandingkan arah visual, konten, dan eksperimen UI sebelum Pixel World dibuat.',
  },
  aboutme: {
    displayName: 'Pixel World Portfolio',
    category: 'PERSONAL PORTFOLIO',
    description: 'Portofolio interaktif bertema dunia pixel: karakter kecil, latar kota malam, animasi scroll, peti proyek, toolbox, aktivitas GitHub, dan tautan kontak.',
  },
  'NASIB-62': {
    displayName: 'NASIB +62',
    category: 'STRATEGY BOARD GAME',
    description: 'Board game ekonomi satir tentang uang, tanah, dan kejutan hidup sehari-hari. Pemain membeli properti, membangun rumah, mengatur saldo, dan bisa berhadapan dengan 1–3 bot dengan gaya strategi berbeda. Intro Remotion, animasi GSAP, dan efek suara menambah nuansa game.',
  },
  office: {
    displayName: 'Riiddev Agent HQ',
    category: '3D OFFICE SIMULATION',
    description: 'Simulasi kantor 3D bergaya life-sim untuk menjelajahi ruang kerja, lounge, pantry, dan ruang game sambil melihat karakter kru serta feed aktivitas. Catatan: kru/feed masih berupa data simulasi; pengiriman tugas cloud memerlukan setup token dan workflow secara terpisah.',
  },
  gemini: {
    displayName: 'Latveria Academy Sandbox',
    category: 'UTBK-SNBT STUDY PLATFORM · SANDBOX',
    description: 'Sandbox eksperimen berbasis codebase Latveria Academy, platform latihan UTBK-SNBT berbahasa Indonesia. README-nya mencakup katalog paket latihan, pengerjaan soal, riwayat dan EXP, dashboard admin untuk bank soal, tryout lintas subtes, serta mode battle. Fitur yang memerlukan API dan database hanya aktif setelah setup lokal/servisnya lengkap.',
  },
  'Quest-Whitman': {
    displayName: 'The Play Goes On',
    category: 'DAILY QUEST CHECK-IN',
    description: 'Website check-in harian The Main Ideas untuk Whitman House. Peserta mengirim bukti screenshot, melihat konfirmasi dan total kehadiran, mengecek riwayat, membuat sertifikat PNG, serta membaca panduan quest. Pencatatan terhubung ke Google Sheets melalui Apps Script.',
  },
  'Tracker-sobal-': {
    displayName: 'Tracker Sobal',
    category: 'FEE & TRANSACTION TRACKER',
    description: 'Aplikasi untuk mencatat transaksi dan fee dari berbagai program, memisahkan status sudah/belum cair, melihat grafik tren per program, memfilter riwayat, dan mengimpor atau mengekspor data. Data transaksi pada versi ini disimpan di browser melalui localStorage.',
  },
  tryoutessaypartho: {
    displayName: 'Nulis Esai by Parthoo',
    category: 'ESSAY PRACTICE TOOL',
    description: 'Nulis Esai by Parthoo adalah workspace latihan esai dengan simulasi ujian, histori jawaban, paket soal, evaluasi akhir, dan AI Essay Coach untuk umpan balik tulisan secara langsung. Fitur AI server membutuhkan konfigurasi API key; evaluasi lokal tetap menjadi fallback jika AI belum aktif.',
  },
  StudyWithMbah: {
    displayName: 'StudyWithMbah',
    category: 'STUDY & LEARNING WEBSITE',
    description: 'Website belajar dengan materi dan tautan latihan, video, serta bank soal PDF per topik. Proyek ini juga mengeksplorasi animasi GSAP dan mascot lab berbasis React/Remotion tanpa memaksa seluruh situs statis bermigrasi ke bundler.',
  },
  'notecanvas-studio': {
    displayName: 'NoteCanvas Studio',
    category: 'DIGITAL NOTEBOOK',
    description: 'Aplikasi notebook digital untuk membuat dan mengatur buku catatan multi-halaman. Fokus pengembangannya meliputi menggambar dengan mouse/touch/stylus, pen dan highlighter, eraser, undo-redo, template kertas, dukungan PDF, ekspor, dan autosave lokal agar catatan tidak bergantung pada layanan cloud berbayar.',
  },
  script: {
    displayName: 'Profile README Experiment',
    category: 'PROFILE README EXPERIMENT',
    description: 'Repository eksperimen seputar struktur README profil GitHub dan template generator. README yang tersedia masih merujuk pada Profile Readme Generator upstream, jadi anggap ini sebagai ruang eksplorasi/template, bukan aplikasi orisinal yang sudah terverifikasi terpisah.',
  },
};

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