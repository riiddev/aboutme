window.SITE = {
  lines: [
    "Hey, I'm Riiddev.",
    "Not an expert. Just curious.",
    "Current mood: a little pixelated.",
    "One level at a time."
  ],

  exploring: [
    { title: "Frontend & UI", text: "Layout, typography, responsive design, interaction details, and motion that feels intentional." },
    { title: "Backend basics", text: "Learning how apps handle data, connect services, and work behind the interface." },
    { title: "Build, break, repeat", text: "Trying ideas in projects, finding what breaks, and improving them as I learn." },
    { title: "Pixel & motion", text: "Expressive interfaces, playful motion, and small details that give a project personality." }
  ],

  tools: [
    { name: "HTML", abbr: "Ht", bg: "#E44D26", fg: "#fff" },
    { name: "CSS", abbr: "Cs", bg: "#2965F1", fg: "#fff" },
    { name: "JavaScript", abbr: "Js", bg: "#F7DF1E", fg: "#1B1840" },
    { name: "TypeScript", abbr: "Ts", bg: "#3178C6", fg: "#fff" },
    { name: "React", abbr: "Re", bg: "#20232A", fg: "#61DAFB" },
    { name: "Vite", abbr: "Vi", bg: "#5555DD", fg: "#fff" },
    { name: "GSAP", abbr: "Ga", bg: "#A9F06D", fg: "#1B1840" },
    { name: "Remotion", abbr: "Rm", bg: "#0B84F3", fg: "#fff" },
    { name: "Google Apps Script", abbr: "As", bg: "#4285F4", fg: "#fff" },
    { name: "Git", abbr: "Gt", bg: "#F05032", fg: "#fff" }
  ],

  links: [
    { label: "GitHub", host: "github.com/riiddev", href: "https://github.com/riiddev" },
    { label: "All repositories", host: "Explore the work", href: "https://github.com/riiddev?tab=repositories" },
    { label: "Learning soundtrack", host: "My Spotify playlist", href: "https://open.spotify.com/playlist/5Qn9lmfjJ6KMuYl0jTIbkO" }
  ],
  miniLinks: [0, 2],

  // Edit project text and links here. Covers are typographic until real screenshots are added.
  projects: [
    {
      id: "nasib-62",
      title: "NASIB +62",
      sub: "Simulasi Warga",
      kind: "Game",
      status: "Work in progress",
      cover: { bg: "#25205F", fg: "#A9F06D", accent: "#BBA9FF", lines: ["NASIB", "+62"] },
      summary: "An Indonesian satirical economy board game about money, land, and everyday curveballs. One human player faces one to three computer opponents on a pentagon-shaped board.",
      details: [
        "Three bot levels use different strategy heuristics rather than extra dice or starting money.",
        "Bot decisions are separated into a strategy module, and the game log explains buy/pass choices.",
        "The in-browser intro uses Remotion Player; effects use the Web Audio API.",
        "The online lobby uses Supabase Realtime and needs project credentials to connect.",
        "The README describes a staged migration from a legacy game engine to React + Vite."
      ],
      note: "The repository describes the project as an ongoing migration, so it is presented as work in progress.",
      tech: ["React", "Vite", "GSAP", "Remotion", "Web Audio API", "Playwright"],
      links: [
        { label: "View source", href: "https://github.com/riiddev/NASIB-62", primary: true }
      ]
    },
    {
      id: "nulis-esai",
      title: "Nulis Esai",
      sub: "by Parthoo",
      kind: "Writing tool",
      cover: { bg: "#BBA9FF", fg: "#25205F", accent: "#25205F", lines: ["Nulis", "Esai"] },
      summary: "An essay-practice app with exam simulation, answer history, an admin panel, and an optional server-side AI Essay Coach.",
      details: [
        "The interface is split into small HTML components and JavaScript modules.",
        "Live AI feedback runs through a server-side endpoint and requires a configured Gemini API key.",
        "A local fallback keeps the final evaluation available when the AI endpoint is not configured."
      ],
      note: "The source repository documents the required Vercel environment variable; AI feedback is not implied to be active on every deployment.",
      tech: ["HTML", "CSS", "JavaScript", "Vercel API", "Gemini API"],
      links: [
        { label: "View source", href: "https://github.com/riiddev/tryoutessaypartho", primary: true }
      ]
    },
    {
      id: "agent-hq",
      title: "Riiddev Agent HQ",
      sub: "A cozy 3D command center",
      kind: "Interactive world",
      cover: { bg: "#DDEFD9", fg: "#29244F", accent: "#8ACABF", lines: ["AGENT", "HQ"] },
      summary: "A Sims-inspired 3D office playground built around rooms, tiny crew characters, and a task-dispatch concept.",
      details: [
        "The office scene uses React, Vite, Three.js, and GSAP.",
        "The task-dispatch path can create GitHub issues and ask OpenCode to work through a GitHub Actions runner after setup.",
        "The crew roster and activity feed remain demo data; no AI agent is connected by default.",
        "API usage, tokens, and external service setup are not included in a ChatGPT subscription."
      ],
      note: "The live dashboard may show its demo experience, but cloud task execution requires the repository's documented secrets and app setup.",
      tech: ["React", "Vite", "Three.js", "GSAP", "GitHub Actions"],
      links: [
        { label: "View source", href: "https://github.com/riiddev/office", primary: true },
        { label: "Open dashboard", href: "https://kantorriddev.vercel.app" }
      ]
    },
    {
      id: "studywithmbah",
      title: "StudyWithMbah",
      sub: "A study space with character",
      kind: "Learning experience",
      cover: { bg: "#FBE3EC", fg: "#25205F", accent: "#D9438B", lines: ["STUDY", "SPACE"] },
      summary: "A study-site experiment with organized learning materials, GSAP motion, and a mascot studio built as a React island with Remotion Player.",
      details: [
        "The static hosting path is intentionally retained rather than requiring a full bundler migration.",
        "The mascot experiment includes pointer-driven gaze, expression presets, and a frame-driven Remotion sequence.",
        "The repository also documents fallback behavior and preservation of existing page interactions."
      ],
      tech: ["HTML", "CSS", "JavaScript", "GSAP", "React", "Remotion"],
      links: [
        { label: "View source", href: "https://github.com/riiddev/StudyWithMbah", primary: true }
      ]
    },
    {
      id: "latveria",
      title: "Latveria",
      sub: "UTBK / SNBT practice platform",
      kind: "Education",
      cover: { bg: "#24213F", fg: "#A9F06D", accent: "#BBA9FF", lines: ["LAT", "VERIA"] },
      summary: "An Indonesian UTBK-SNBT practice platform with question sets, saved attempts, progress tracking, and separate participant/admin experiences.",
      details: [
        "The monorepo uses React + Vite on the web side and Hono/Bun for the API.",
        "The README documents authentication, role and ownership checks, question import tools, and practice history.",
        "The backend and database must be configured and migrated for participant and administrator routes to work."
      ],
      note: "The repository is named riiddev/gemini, while its README identifies the project as Latveria.",
      tech: ["React", "Vite", "Tailwind", "Hono", "Bun", "Drizzle"],
      links: [
        { label: "View source", href: "https://github.com/riiddev/gemini", primary: true }
      ]
    },
    {
      id: "profile-readme",
      title: "Pixel GitHub profile",
      sub: "My README and contribution visuals",
      kind: "Profile",
      wide: true,
      cover: { bg: "#0D1118", fg: "#A9F06D", accent: "#BBA9FF", lines: ["cozy", "pixel mode"] },
      summary: "A personal GitHub profile styled as a tiny pixel arcade, with an animated ninja companion, 3D contribution views, and a Pac-Man contribution graph.",
      details: [
        "GitHub Actions generate the contribution visuals from profile activity.",
        "The README uses the pixel style as a personal identity, rather than a claim about expertise.",
        "The Spotify player links to the playlist used while learning and designing."
      ],
      tech: ["Markdown", "SVG", "YAML", "GitHub Actions"],
      links: [
        { label: "View profile README", href: "https://github.com/riiddev/riiddev", primary: true }
      ]
    }
  ]
};
