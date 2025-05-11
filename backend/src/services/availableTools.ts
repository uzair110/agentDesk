export interface ToolMetadata {
    key:         string;
    name:        string;
    description: string;
    configSchema: object; 
  }
  
  export const availableTools: ToolMetadata[] = [
    {
      key: "githubSummarizer",
      name: "GitHub PR Summarizer",
      description: "Fetch and summarize a GitHub Pull Request.",
      configSchema: {
        type: "object",
        properties: {
          owner:  { type: "string" },
          repo:   { type: "string" },
          token:  { type: "string" },
          apiKey: { type: "string" },
          model:  { type: "string" }
        },
        required: ["owner","repo","token","apiKey","model"]
      }
    },
    {
      key: "slackNotifier",
      name: "Slack Notifier",
      description: "Post a message to a Slack channel.",
      configSchema: {
        type: "object",
        properties: {
          webhookUrl: { type: "string" },
          channel:    { type: "string" }
        },
        required: ["webhookUrl","channel"]
      }
    }
    // …add new tools here…
  ];
  