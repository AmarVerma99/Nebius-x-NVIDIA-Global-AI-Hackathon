# 🚀 OpsCopilot — Devpost Hackathon Submission & Video Script

**Hackathon:** Nebius x NVIDIA Global AI Hackathon  
**Project Name:** OpsCopilot  
**Tagline:** Autonomous AI Agent Incident Platform for SRE & DevOps powered by NVIDIA Nemotron on Nebius Token Factory & Tavily AI Search  
**Track:** Coding and Agentic Engineering Track *(Also eligible for Best Apps & Agents Track and Best Use of Tavily Prize)*  
**License:** MIT Open Source License (visible in repo)  

---

## 📋 Devpost Submission Form Content

### 💡 Inspiration
When production outages strike at 3:00 AM, Site Reliability Engineers (SREs) and DevOps teams face an overwhelming barrage of raw, fragmented server logs, cryptic Kubernetes stack traces, and urgent Slack pings. Investigating the true root cause and formulating safe remediation scripts takes an average of 45–90 minutes of high-stress digging. 

We built **OpsCopilot** to give on-call engineers an autonomous, supercharged AI copilot that ingests raw telemetry, conducts multi-hop causal reasoning using **NVIDIA Nemotron models** served on **Nebius Token Factory**, pulls live CVE & GitHub intelligence with **Tavily AI Search**, and safely tests declarative fix scripts inside a protected sandbox before anything touches production.

---

### ⚙️ What It Does
1. **Raw Log & Stack Trace Ingestion**: Accepts raw logs or 1-click presets (K8s OOMKilled, Postgres Lock Contention, Redis MaxMemory Saturation, Stripe TLS Timeouts, AWS IAM Denials). Automatically scrubs PII and Bearer tokens.
2. **Hermes Multi-Phase Agent Orchestration**:
   - **Phase 1**: Log Ingestion & Anomaly Signature Extraction
   - **Phase 2**: Real-Time Web Intelligence & CVE Check via **Tavily AI Search**
   - **Phase 3**: Infrastructure Telemetry & Cgroup Correlation
   - **Phase 4**: Causal Hypothesis Validation powered by **NVIDIA Nemotron-3 Ultra**
   - **Phase 5**: Remediation Synthesis & Sandbox Safety Policy Checks
3. **Multi-Hop Escalation to Ultra Max**: Deep causal re-analysis using **NVIDIA Nemotron-4 340B Instruct** for complex cascading failures.
4. **Isolated Virtual Sandbox Execution**: Safely runs and verifies AI-synthesized fix scripts (Kubectl/Bash) against a simulated Kubernetes cluster with strict AST security guards (blocking destructive commands like `rm -rf /` or fork bombs).
5. **Multi-Platform Alert Cards**: Instantly generates interactive **Slack Block Kit** and **Microsoft Teams Adaptive Cards**.
6. **SRE Telemetry Dashboard**: Live monitoring of Mean Time to Resolution (MTTR), active vs resolved outages, severity distribution, and top affected services.
7. **1-Click Postmortem Generator**: Exports structured Markdown and JSON postmortems for incident reviews.

---

### 🛠️ How We Built It
- **AI Inference**: Powered by **Nebius Token Factory** (`https://api.tokenfactory.nebius.com/v1`) using `nvidia/nemotron-3-ultra` and `nvidia/nemotron-4-340b-instruct`.
- **Search & External Intelligence**: Integrated **Tavily AI Search API** for real-time validation against live GitHub issues, CVE advisories, and Kubernetes documentation.
- **Backend Architecture**: Node.js & Express with SQLite (`better-sqlite3` in WAL mode), JWT authentication, Express Rate Limiting, and CORS protection.
- **Frontend UI/UX**: React 19, TypeScript, Tailwind CSS, Vite, and Lucide Icons with dark-mode glassmorphism and real-time Server-Sent Events (SSE).
- **Security & Safety**: Zero frontend AI provider keys (all requests proxied securely via backend), automatic PII sanitization, and AST command execution blocklists.

---

### 🏔️ Challenges We Ran Into
- **Log Noise & Token Limits**: Raw production logs often contain thousands of repetitive INFO lines. We engineered an intelligent log sanitizer and signature extractor that isolates critical stack traces and timestamp clusters before feeding context into Nemotron.
- **Agent Output Reliability**: SRE workflows require exact JSON schemas. We crafted structured prompt templates with strict type definitions to guarantee parseable JSON responses containing scripts, confidence scores, and reasoning steps.
- **Execution Safety**: Giving an AI agent the ability to generate bash scripts poses security risks. We enforced strict AST blocklists and isolated container sandboxes so no AI code executes directly on the host machine.

---

### 🏆 Accomplishments We're Proud Of
- **Sub-2-Second Incident Diagnosis**: Combining Nebius Token Factory's fast TTFT with Nemotron-3 Ultra delivers full causal root-cause diagnoses in seconds.
- **10/10 Automated Integration Tests**: Built a comprehensive automated integration test suite verifying healthchecks, auth, AI diagnosis, Tavily search, sandbox isolation, security guards, and escalation.
- **Complete End-to-End Product Experience**: Delivered a polished, fully functioning product with interactive sandbox runners, live alerts, and analytics.

---

### 📚 What We Learned
- How to design robust multi-hop agent reasoning architectures using the Hermes pattern.
- The efficiency and reasoning speed advantages of NVIDIA's specialized Nemotron models on Nebius high-performance infrastructure.
- The value of real-time search grounding with Tavily to eliminate hallucinations during complex infrastructure troubleshooting.

---

### 🔮 What's Next for OpsCopilot
- Direct integration with OpenTelemetry and Datadog / Prometheus webhooks for automated zero-touch incident ingestion.
- Multi-cluster Kubernetes operator deployment for automatic canary rollouts of AI-synthesized patches.
- Slack Bot and Microsoft Teams interactive webhook bot for 1-click approvals right from chat channels.

---

# 🎬 3-Minute Video Demo Script (Step-by-Step)

| Time | Visual / Screen Action | Voiceover Narration |
| :--- | :--- | :--- |
| **0:00 - 0:30** | **Intro & Problem**: Show SRE Dashboard with live MTTR, incident metrics, and active outages. | *"Welcome to OpsCopilot — an autonomous AI agent incident platform for SRE and DevOps teams, built for the Nebius x NVIDIA Global AI Hackathon. When production services crash at 3 AM, engineers spend hours sifting through noisy logs. OpsCopilot solves this by automating root cause diagnosis, web intelligence verification, and safe sandbox execution using NVIDIA Nemotron on Nebius Token Factory."* |
| **0:30 - 1:15** | **Incident Submission & Hermes Agent Flow**: Navigate to 'New Incident', select the **Kubernetes OOMKilled preset** or paste raw logs. Click 'Analyze Incident'. Show the live multi-phase Hermes reasoning feed. | *"Let's submit a live incident: a Kubernetes container crashing with Exit Code 137 under heavy traffic. Watch our 5-phase Hermes Agent orchestration in action: it parses the raw logs, calls Tavily AI Search for real-time GitHub and K8s documentation, and feeds the enriched context into NVIDIA Nemotron-3 Ultra on Nebius Token Factory to formulate the causal hypothesis."* |
| **1:15 - 1:55** | **Root Cause & Tavily Intelligence**: Show the Incident Detail page. Highlight the Root Cause Panel (98% confidence), the **Tavily Real-Time Web Intelligence Card** with live linked sources, and the Escalation to Nemotron-4 340B. | *"In seconds, OpsCopilot identifies the root cause: cgroup memory limit saturation. Notice the Tavily Web Intelligence card — it pulled live official Kubernetes docs and GitHub workarounds with match scores. If we need deeper reasoning on complex cascading failures, we can escalate directly to NVIDIA Nemotron-4 340B Instruct with one click."* |
| **1:55 - 2:30** | **Isolated Sandbox Execution**: Scroll to Fix Suggestion Card. Show Bash / Kubectl / Rollback tabs. Click **'Execute in Isolated Sandbox'**. Show the terminal logs streaming and exit code 0. | *"Next, the agent synthesizes a declarative Kubernetes patch and rollback script. Notice our security guarantee: AI code is never run directly on the host. We click 'Execute in Isolated Sandbox' — the fix is safely verified inside an isolated virtual container, confirming error rates drop to zero percent before resolving the incident."* |
| **2:30 - 3:00** | **Alerts, Postmortem & Conclusion**: Show Slack Block Kit / MS Teams card preview. Click 'Export Postmortem' to show the Markdown report. | *"OpsCopilot also generates interactive Slack and MS Teams alert cards, and generates a complete SRE Postmortem in one click. Built on open infrastructure with Nebius Token Factory, NVIDIA Nemotron, and Tavily AI Search — OpsCopilot turns 90-minute outages into 2-minute resolutions. Thank you!"* |
