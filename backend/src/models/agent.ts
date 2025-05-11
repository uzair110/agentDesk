export interface ToolEntry {
  key:       string;              
  handler:   string;              
  config:    Record<string, any>;
}

export interface Agent {
  id:          string;
  name:        string;
  description?: string;
  config: {
    tools: ToolEntry[];
  };
}

export const agents: Agent[] = [];
