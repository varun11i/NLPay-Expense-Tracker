# NLPay - Expense Tracker  
Group 15: Varun Mehrotra (vm749), Janhavi Sharma (js3798), Samruddhi Bhalerao (sb2705)

This project is a **personal expense tracker** application with a custom frontend and backend, developed as part of our Data Management for Advanced Data Science Applications course project.

The app lets you:

- Enter expenses in **natural language** (e.g. “Paid $15 for lunch at Subway on 5th Dec”)
- Use an **LLM to parse** the text into structured data (amount, category, date, currency)
- Store everything in a **SQLite** database
- View, filter, edit, and confirm transactions
- See a **dashboard** with a line chart (spending over time) and pie chart (spending by category)

---

## Tech Stack

### Backend

- **Language:** Go  
- **Web framework:** [Echo](https://echo.labstack.com/)  
- **Database:** SQLite (`expenses.db`)  
- **Config:** [koanf](https://github.com/knadh/koanf) for TOML + environment variables  
- **LLM integration:** OpenAI-compatible client  
  - In our setup this points to **Groq** (e.g. `llama-3.1-8b-instant`) via the OpenAI-compatible API  

### Frontend

- **Framework:** Vue 3 + TypeScript  
- **Build tool:** Vite  
- **Styling:** Tailwind CSS + daisyUI  
- **Charts:** Line + pie chart components in the `DashboardView` for visualizing spending patterns  

---

## Features

### Transactions

- **Natural-language input**
  - The “Add Expense” modal accepts a free-text description.
  - A date picker lets you choose the transaction date.
  - The selected date is included in the text sent to the LLM so it can correctly parse the `transaction_date`.

- **Structured storage**
  - Each transaction is stored with:
    - `id`
    - `description`
    - `amount`
    - `currency`
    - `category`
    - `transaction_date`
    - `confirm` (boolean)

- **Table view**
  - Sortable columns: Date, Description, Category, Amount.
  - Filters:
    - Search by description
    - Category dropdown
    - Quick ranges (Today, This Week, This Month, Last 3 Months)
    - Advanced filters: date range, min / max amount
  - CSV export for the currently filtered set.

- **Editing and bulk actions**
  - Per-row:
    - Edit: change description, amount, currency, category, date, and confirm status.
    - Delete: remove a transaction (with confirmation modal).
  - Bulk:
    - Select multiple rows and:
      - Bulk edit (category/confirm)
      - Bulk confirm
      - Bulk delete
  - “Confirm all” control with scope:
    - All transactions
    - Only visible (filtered) transactions
    - Only today’s transactions

### Dashboard

- Custom **Dashboard** view that calls backend reporting endpoints:
  - Line chart of **daily spending** over a selected date range.
  - Pie chart of **spending by category**.
- Uses aggregate queries on the transactions table so the charts directly reflect what is stored in SQLite.

### Settings

- Settings API + UI to configure:
  - **Base currency** (e.g. USD)
  - **Timezone**
- The backend uses the configured currency when aggregating totals for the dashboard.

---

## Getting Started

### 1. Prerequisites

You’ll need:

- **Go** (1.21+ recommended)  
- **Node.js** and a package manager:
  - The project uses **pnpm** for the UI:
    ```bash
    npm install -g pnpm
    ```
- (Optional) **Docker** and **docker-compose** if you want to run it via containers instead of directly.

You will also need an **OpenAI-compatible LLM API key**.  
This project is tested with **Groq**, but you can use any provider that supports the OpenAI Chat Completions API shape.

---

### 2. Environment variables

Create a `.env` file in the project root (next to `main.go`) and add:

```env
# LLM provider (example: Groq with OpenAI-compatible API)
GROQ_TOKEN=sk-your-groq-api-key-here

# Model & base URL for the OpenAI-compatible client
GULLAK_OPENAI_MODEL=llama-3.1-8b-instant
GULLAK_OPENAI_BASE_URL=https://api.groq.com/openai/v1

# Optional: used to silence legacy OPENAI_TOKEN warnings in some configs
OPENAI_TOKEN=dummy
