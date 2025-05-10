export interface Agent {
    id: string;
    name: string;
    description?: string;
    config: Record<string, any>;
  }
  
  export const agents: Agent[] = [];
  