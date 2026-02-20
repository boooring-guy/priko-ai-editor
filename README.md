<p align="center">
  <h1 align="center">Priko</h1>
  <p align="center">
    A self-hosted AI code editor — inspired by <a href="https://www.youtube.com/@codewithantonio">Code with Antonio</a>, built from scratch with my own stack.
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Bun-runtime-f9f1e1?style=flat-square&logo=bun" alt="Bun" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Biome-linter-60A5FA?style=flat-square&logo=biome" alt="Biome" />
</p>

---

## 🧠 Philosophy

This isn't a copy-paste tutorial project. The architecture and ideas come from Code with Antonio's AI editor series, but every line is written with **my own tech choices and learning goals** in mind.

The primary focus is:

- **Self-hosting first** — Docker-based, single-server deployments instead of managed cloud services.
- **Infrastructure mastery** — understanding DevOps, containers, and orchestration hands-on.
- **Learning by doing** — swapping in unfamiliar tools (Bun, Biome, Tailwind v4) to grow as a developer, not just to ship.

---

## ⚙️ Tech Stack

| Layer         | Technology                                                           |
| ------------- | -------------------------------------------------------------------- |
| **Framework** | [Next.js 16](https://nextjs.org/)                                    |
| **UI**        | [React 19](https://react.dev/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Styling**   | [Tailwind CSS 4](https://tailwindcss.com/)                           |
| **Language**  | [TypeScript 5](https://www.typescriptlang.org/)                      |
| **Auth**      | [Better Auth](https://www.better-auth.com/)                          |
| **Database**  | [Neon](https://neon.tech/) (Postgres)                                |
| **Realtime**  | [Socket.IO](https://socket.io/)                                      |
| **Analytics** | [PostHog](https://posthog.com/)                                      |
| **Linting**   | [Biome](https://biomejs.dev/)                                        |
| **Runtime**   | [Bun](https://bun.sh/)                                               |

> **Why Bun?** Faster installs, native TypeScript execution, and a unified toolchain — no need for separate Node + npm/pnpm.

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.1+
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone the repo
git clone https://github.com/<your-username>/priko.git
cd priko

# Install dependencies
bun install

# Start the dev server
bun dev
```

The app will be running at **[http://localhost:3000](http://localhost:3000)**.

---

## 📜 Available Scripts

| Command          | Description                  |
| ---------------- | ---------------------------- |
| `bun dev`        | Start the development server |
| `bun run build`  | Create a production build    |
| `bun start`      | Serve the production build   |
| `bun run lint`   | Lint the codebase with Biome |
| `bun run format` | Auto-format code with Biome  |

---

## 🗂️ Project Structure

```
priko/
├── public/            # Static assets (SVGs, icons)
├── src/
│   └── app/           # Next.js App Router
│       ├── layout.tsx # Root layout
│       ├── page.tsx   # Home page
│       └── globals.css
├── biome.json         # Biome config (lint + format)
├── next.config.ts     # Next.js config
├── tsconfig.json      # TypeScript config
└── package.json
```

---

## 🐳 Self-Hosting (Planned)

The long-term goal is to run the entire stack on a **single Linux server** using Docker:

- Official Docker images wherever available
- Minimal cloud dependency
- Full control over data and infrastructure

> _Detailed Docker Compose setup and deployment guide coming soon._

---

## 🗺️ Roadmap

- [x] Project scaffolding (Next.js + Bun + Biome)
- [ ] Authentication with Better Auth
- [ ] Database integration (Neon / Postgres)
- [ ] Core editor UI with shadcn/ui
- [ ] Realtime collaboration via Socket.IO
- [ ] Analytics with PostHog
- [ ] Dockerized self-hosted deployment
- [ ] AI-powered editor features

---

## 📄 License

This project is for **personal learning and experimentation**. Feel free to explore, but please build your own version rather than cloning this directly — that's the whole point. 🙂

---

<p align="center">
  <sub>Built with ☕ and curiosity.</sub>
</p>
