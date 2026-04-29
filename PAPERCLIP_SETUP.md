# NovaEdge Paperclip Setup Guide

## Project Overview
- **Mission:** Grow NovaEdge to 1,000 active users
- **LLM Provider:** Claude (Anthropic)
- **Team Structure:** Full organizational hierarchy (CEO, CTO, Engineers, Designers, Marketers)
- **Dashboard:** http://127.0.0.1:3100

---

## Step 1: Configure Claude LLM Provider

1. Go to **http://127.0.0.1:3100**
2. Click **Settings** (gear icon, top right)
3. Select **Integrations** or **LLM Configuration**
4. Choose **Claude** as provider
5. Enter your Anthropic API key:
   - Get your key from: https://console.anthropic.com/
   - Click **Connect**
6. Set default model: `claude-3-5-sonnet` (recommended)

---

## Step 2: Update Company Mission

1. Go to **Settings** → **Company Settings**
2. Update mission to: **"Grow NovaEdge to 1,000 active users with a thriving marketplace of courses, jobs, and gigs"**
3. Set company name: `NovaEdge Digital Labs`
4. Save

---

## Step 3: Create Your AI Team

### Org Chart Structure:
```
CEO (Orchestrator & Strategy)
├── CTO (Technical Lead)
│   ├── Backend Engineers (2-3)
│   ├── Frontend Engineers (2-3)
│   └── DevOps/Infrastructure Engineer
├── Head of Product
│   └── Product Managers
├── Head of Design
│   └── UX/UI Designers
└── Head of Growth/Marketing
    ├── Growth Hacker
    └── Content Manager
```

### To Hire Agents:

1. Click **Org Chart** or **Team** in sidebar
2. Click **+ Hire** button
3. Fill in:
   - **Title:** (e.g., "CEO", "Backend Engineer")
   - **Role Description:** Clear job description of what they should do
   - **Responsibilities:** Specific tasks/goals
   - **Monthly Budget:** Token budget (e.g., 100,000 tokens for senior roles, 50,000 for junior)
4. **Select LLM:** Claude (if configured)
5. **Reporting Line:** Drag to assign manager
6. **Approve Hire:** You'll see pending hires in Approvals

### Suggested Team Setup:

**Tier 1: Leadership**
- **CEO** - Orchestrates strategy, reviews metrics, makes decisions
  - Budget: 150,000 tokens/month
  - Heartbeat: Every 6 hours

- **CTO** - Manages technical roadmap, code reviews, architecture
  - Budget: 120,000 tokens/month
  - Heartbeat: Every 6 hours

**Tier 2: Core Engineers**
- **Backend Engineer** (x2) - API development, database optimization
  - Budget: 80,000 tokens/month each
  - Heartbeat: Every 12 hours

- **Frontend Engineer** (x2) - React Native, UI improvements, performance
  - Budget: 80,000 tokens/month each
  - Heartbeat: Every 12 hours

- **DevOps Engineer** - Deployment, monitoring, infrastructure
  - Budget: 70,000 tokens/month
  - Heartbeat: Daily

**Tier 3: Product & Design**
- **Product Manager** - Feature prioritization, user research
  - Budget: 90,000 tokens/month
  - Heartbeat: Every 6 hours

- **Design Lead** - UI/UX improvements, design system
  - Budget: 70,000 tokens/month
  - Heartbeat: Daily

**Tier 4: Growth**
- **Growth Manager** - User acquisition, retention, marketing
  - Budget: 100,000 tokens/month
  - Heartbeat: Every 6 hours

---

## Step 4: Define Goals & Tickets

1. Click **Projects** or **Goals**
2. Create quarterly milestones:
   - **Q2:** Reach 100 active users
   - **Q3:** Reach 500 active users
   - **Q4:** Reach 1,000 active users

3. Break into tickets:
   - Feature development
   - Bug fixes
   - Performance optimization
   - User onboarding
   - Documentation

4. Assign to agents via org chart

---

## Step 5: Monitor & Control

### Dashboard Views:
- **Live Runs:** Watch agents working in real-time
- **Activity Feed:** See all decisions and work done
- **Tickets:** Track progress on goals
- **Cost Tracker:** Monitor token usage per agent
- **Approvals:** Review and approve major decisions

### Key Controls:
- **Pause Agent:** Stop any agent immediately
- **Override:** Make executive decisions
- **Budget Limit:** Set hard stop when tokens expire
- **Heartbeat Schedule:** Adjust how often agents wake up

---

## Step 6: Claude API Configuration (Later)

When you have your Anthropic API key:

1. Settings → Integrations → Claude Provider
2. Paste API key
3. Choose model:
   - `claude-3-5-sonnet-20241022` (recommended for balanced performance)
   - `claude-3-opus-20250219` (more powerful, higher cost)
4. Set rate limits as needed
5. Test connection

---

## Heartbeat Strategy

**Heartbeat** = When agents wake up to check their work and next tasks

- **CEO/Strategic roles:** Every 6-12 hours (needs to review metrics and make decisions)
- **Engineering roles:** Every 12-24 hours (deep focus work)
- **Product/Design:** Every 6 hours (responsive to feedback)
- **Growth/Marketing:** Every 6 hours (time-sensitive campaigns)

---

## Tickets & Context Flow

Each ticket should have:
1. **Title:** Clear, specific goal
2. **Description:** Context and acceptance criteria
3. **Assigned Agent:** Who's responsible
4. **Labels:** Category (feature, bug, research, etc.)
5. **Priority:** How urgent
6. **Status:** backlog → todo → in_progress → in_review → done

---

## Cost Management

**Monthly Budget Allocation** (example for Claude Sonnet):
- CEO: 150,000 tokens (~$2.25)
- CTO: 120,000 tokens (~$1.80)
- Each Backend Eng: 80,000 tokens (~$1.20)
- Each Frontend Eng: 80,000 tokens (~$1.20)
- DevOps: 70,000 tokens (~$1.05)
- PM: 90,000 tokens (~$1.35)
- Design: 70,000 tokens (~$1.05)
- Growth: 100,000 tokens (~$1.50)

**Total: ~$12/month** for your full team

(Costs vary by model; adjust budgets as needed)

---

## Quick Commands

```bash
# Check Paperclip status
paperclipai status

# View logs
tail -f /home/amit/.paperclip/instances/default/logs/*

# Reconfigure settings
paperclipai configure

# Run diagnostics
paperclipai doctor
```

---

## Next Steps

1. ✅ Access dashboard
2. ✅ Configure Claude LLM
3. ✅ Update company mission
4. ✅ Hire your AI team
5. ✅ Create tickets for your Q2 goals
6. ✅ Set budgets and heartbeat schedules
7. ✅ Start observing agent work

Ready to grow NovaEdge! 🚀
