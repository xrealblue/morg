# Morg - AI Code Analysis Platform

Morg is an AI-powered GitHub code analysis platform designed to help developers onboard to codebases faster, ask questions about their code in plain English, and read AI-summarized commit histories.

---

## Key Features

### 1. GitHub-Powered Authentication
* **Seamless Login**: Integrated with [Better Auth](https://www.better-auth.com/) supporting GitHub OAuth.
* **Security**: Uses secure session tokens (`better-auth.session_token` / `__Secure-better-auth.session_token`) stored in HTTP-only cookies and protected routes.

### 2. Multi-Project Management
* **Link Repositories**: Create and manage multiple projects by linking GitHub repository URLs (e.g., `https://github.com/username/repo`).
* **Private Repos**: Optionally supply a Personal Access Token (`githubToken`) to analyze private repositories.
* **Interactive Sidebar**: Quickly switch between projects from the sidebar. The active project synchronizes reactively across the dashboard, Q&A, and commits list.

### 3. Automated Repository Indexing & Embedding
* **Source Code Loading**: Automatically crawls and reads the source files in your GitHub repository.
* **AI File Summarization**: Uses Google Gemini to generate a high-level summary of what each file does.
* **Vector Semantic Search**: Converts file summaries into 768-dimensional embeddings using Gemini's text-embedding model and stores them in PostgreSQL using the `pgvector` extension.

### 4. AI Commit Logs
* **Automatic Polling**: Fetches new commits from the linked GitHub repository.
* **AI Summaries**: Uses Gemini to analyze commit diffs and write human-friendly, concise summaries of what each commit changes.

### 5. AI Q&A Assistant (Retrieval-Augmented Generation)
* **Natural Language Q&A**: Ask questions about your code (e.g., "Which file should I edit to change the theme?").
* **Semantic Search**: Searches and matches your question against the database of code embeddings to retrieve the most relevant code files.
* **RAG Context**: Feeds the relevant code snippets directly to Gemini to generate accurate answers.
* **Streaming Responses**: Streams answers token-by-token for a fast, interactive experience.
* **References**: Displays clickable links to the exact files referenced by the AI.

---

## Technical Stack

* **Frontend**: Next.js 15 (App Router, React 19)
* **Backend API**: tRPC v11 (Type-safe API)
* **Database**: PostgreSQL with `pgvector` (via Prisma 6)
* **AI Engine**: Google Gemini API + Vercel AI SDK
* **Authentication**: Better Auth
* **Styling**: Tailwind CSS v4

---

## How to Use the App

1. **Sign In**: Navigate to `/sign-in` and sign in with GitHub.
2. **Create a Project**:
   - Go to **New Project** page (`/create`).
   - Enter a name, GitHub Repository URL, and optional Access Token.
   - Click **Create Project**.
3. **Explore Dashboard**:
   - View the linked repo.
   - Check the **Commit Log** to read AI-generated summaries of recent changes.
4. **Ask Questions**:
   - Open **Q&A** from the sidebar or use the input box on the dashboard.
   - Type a question about the codebase.
   - Receive structured answers pointing to the source files.
