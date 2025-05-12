import { chatCompletion, ChatMessage } from "./groqClient";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY!;
const GROQ_MODEL   = process.env.NEXT_PUBLIC_GROQ_MODEL!;
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN!; // your PAT

export interface SummarizerConfig {
  owner: string;
  repo:  string;
}

const getLatestPrNumber = async (cfg: SummarizerConfig): Promise<number> => {
  const prRes = await fetch(
    `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/pulls`,
    { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } }
  );
  const prs = await prRes.json() as { number: number }[];
  if (prs.length === 0) {
    return -1;
  }
  return prs[0].number;
};

export async function summarizePr(
  cfg: SummarizerConfig,
  prNumber: number | string
): Promise<string> {

  if (prNumber === "latest") {
    prNumber = await getLatestPrNumber(cfg);
  }

  if (prNumber === -1) {
    return `No pull requests found in ${cfg.owner}/${cfg.repo}`;
  }

  const prRes = await fetch(
    `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/pulls/${prNumber}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept:        "application/vnd.github.v3+json",
      },
    }
  );

  if (prRes.status === 404) {
    return `Pull request #${prNumber} does not exist in ${cfg.owner}/${cfg.repo}`;
  }

  if (!prRes.ok) {
    throw new Error(`GitHub API error: ${prRes.status} ${prRes.statusText}`);
  }
  const pr = await prRes.json() as {
    title: string;
    body:  string;
    html_url: string;
  };

  const messages: ChatMessage[] = [
    {
      role:    "system",
      content: `You are a PR summarization assistant for ${cfg.owner}/${cfg.repo}.`,
    },
    {
      role:    "user",
      content: `
Summarize this PR (#${prNumber}):

Title: ${pr.title}

Description:
${pr.body || "(no description)"}

URL: ${pr.html_url}
      `.trim(),
    },
  ];

  // 3) Call Groq
  return chatCompletion(GROQ_API_KEY, GROQ_MODEL, messages);
}
