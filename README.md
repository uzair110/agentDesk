# AgentDock

A multi-agent MCP server with a web UI for registering, managing, and interacting with intelligent agents.

## Prerequisites

* Docker & Docker Compose installed on your machine
* (Optional) A free Groq Cloud API key for natural-language agent interactions

## Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/<your-org>/agentdock.git
   cd agentdock
   ```

2. **Build & run with Docker Compose**

   ```bash
   docker-compose up --build
   ```

   * Frontend UI will be available at [http://localhost:3000](http://localhost:3000)
   * Backend (MCP server) health-check at [http://localhost:4000/health](http://localhost:4000/health)

3. **Stopping the services**

   ```bash
   docker-compose down
   ```

## Next Steps

* Configure your Groq Cloud credentials in a `.env` file in `backend/`:

  ```text
  GROQ_API_KEY=your_free_tier_key
  ```
* Register new agents via the `/agents` REST endpoints.
* Interact with agents in the `/chat` UI.

---

*Happy hacking!*
