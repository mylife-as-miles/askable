<a href="https://askable.com/">
<img alt="Askable" src="./public/og.jpg">
</a>

<div align="center">
    <h1>Askable</h1>
    <p>
        Chat with your CSV files using AI. Upload a CSV, ask questions, and get instant, code-backed answers and visualizations.
    </p>
</div>

## Tech Stack

- **Frontend**: Next.js, Typescript, Tailwind CSS, Shadcn UI
- **OpenRouter LLM**: Streams answers and code suggestions via OpenRouter
  

## How it works

1. User uploads a CSV file
2. The app analyzes the CSV headers and suggests insightful questions
3. User asks a question about the data
4. The LLM generates Python code to answer the question. Code execution is currently stubbed; wire up your own code runner if desired.
5. All chats and results are stored in Upstash Redis for fast retrieval

## Cloning & running

1. Fork or clone the repo
2. Create accounts at [OpenRouter](https://openrouter.ai/) and [Upstash](https://upstash.com/) for LLM and Redis
3. Create a `.env` file and add your API keys:
    - `OPENROUTER_API_KEY`
    - (optional) `OPENROUTER_REFERER` and `OPENROUTER_TITLE`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Run `pnpm install` and `pnpm run dev` to install dependencies and start the app locally

Open [http://localhost:3000](http://localhost:3000) to use Askable.
