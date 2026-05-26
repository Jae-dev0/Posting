# React Vite Application

This template provides a minimal setup to get React working in Vite with HMR (Hot Module Replacement), ESLint configuration, and a production-ready Docker setup. Optional support for VSCode Dev Containers is included for streamlined development.

## 🚀 Get Started

### ✅ Prerequisites

- **Node.js** v22+
- **pnpm** (latest stable) – [Install pnpm](https://pnpm.io/installation)
- **Docker** and **Docker Compose** (for containerized usage)
- **VSCode** with the Dev Containers extension (optional)

---

### 📦 Installation

#### Automatically generate a new repository

Click <a href="https://github.com/jacliner/react-ts-vite-template/generate" target="_blank">here</a> to generate a new repository from this template.

- Select your GitHub username as the owner.
- Make sure to set the repository visibility to Private (recommended).
- Clone your generated repository.

#### Manual

If automatically generating a new repository does not work, follow these steps instead.

- Click <a href="https://github.com/jacliner/react-ts-vite-template/archive/refs/heads/main.zip">here</a> to download the ZIP archive of the repo.
- Push your code to the new repository.

---

### 🧪 Commands

##### `pnpm dev`

Runs the app in the development mode.\
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

##### `pnpm build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

See the section about [deployment](https://vitejs.dev/guide/static-deploy) for more information.

#### `pnpm run lint`

Runs ESLint to detect code quality and style issues.

#### `pnpm run format`

Automatically format your code using Prettier.

---

### 🧱 Dev Container (VSCode)

If you’re using VSCode Dev Containers:

- Open the project in VSCode.
- When prompted, Reopen in Container.
- Your development environment will be bootstrapped with all necessary dependencies.

---

### 🐳 Docker Usage

#### `docker-compose up --build -d`

Builds and starts the app in detached mode.

#### `docker-compose down`

Stop and remove the containers

---

### Agent instructions (`AGENTS.md`)

This repo includes **`AGENTS.md`** — the canonical copy for Jacliner React + Vite apps (Baseline 2024, stack, `.cursor/rules/`, Modern Web Guidance).

When you change org-wide agent policy:

1. Edit **`AGENTS.md`**, **`.cursor/rules/`**, and **`.cursor/skills/`** in this template repo
2. Copy them **as-is** into each app repo (identical across projects)

New repos generated from this template should include the same `AGENTS.md` and `.cursor/` tree without edits.
