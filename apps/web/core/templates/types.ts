export type TemplateCategory = "general" | "ai" | "web" | "game_jam" | "open_source" | "security" | "mobile" | "iot" | "university" | "startup";

export interface WorkspaceTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: TemplateCategory;
  tags: string[] | null;
  featured: boolean;
  builtIn: boolean;
  config: TemplateConfig;
  usageCount: number;
}

export interface TemplateConfig {
  sections?: string[];
  deliverables?: string[];
  checklist?: string[];
  noteTemplates?: string[];
  tags?: string[];
}

export interface WizardState {
  step: "source" | "event" | "template" | "details" | "review" | "creating";
  source: "event" | "template" | "clone" | "blank" | null;
  eventId: string | null;
  templateId: string | null;
  cloneWorkspaceId: string | null;
  name: string;
  slug: string;
  description: string;
  organizer: string;
  startDate: string;
  endDate: string;
  timezone: string;
}

export const BUILT_IN_TEMPLATES: (Omit<WorkspaceTemplate, "id" | "usageCount"> & { id?: string })[] = [
  {
    id: "blank", name: "Blank Workspace", slug: "blank",
    description: "Start from scratch with an empty workspace. Configure everything yourself.",
    category: "general", tags: ["minimal"], featured: false, builtIn: true,
    config: {},
  },
  {
    id: "general", name: "General Hackathon", slug: "general",
    description: "A well-rounded template suitable for most hackathons. Includes planning, ideas, research, and submission structure.",
    category: "general", tags: ["comprehensive"], featured: true, builtIn: true,
    config: {
      sections: ["objectives", "milestones", "deliverables", "requirements", "risks", "decisions"],
      deliverables: ["Application", "Repository", "README", "Demo Video", "Screenshots", "Presentation"],
      checklist: ["Repository created", "README written", "License added", "Demo ready", "Presentation prepared"],
    },
  },
  {
    id: "ai", name: "AI Hackathon", slug: "ai-hackathon",
    description: "Optimised for AI/ML hackathons. Includes dataset research, model planning, and evaluation criteria.",
    category: "ai", tags: ["ai", "ml", "data"], featured: true, builtIn: true,
    config: {
      sections: ["objectives", "milestones", "deliverables", "requirements", "risks"],
      deliverables: ["Model", "Dataset", "Notebook", "Presentation", "Demo", "Documentation"],
      checklist: ["Dataset sourced", "Model trained", "Results evaluated", "Demo prepared"],
      noteTemplates: ["Dataset notes", "Model architecture", "Training results"],
      tags: ["ml", "ai", "data"],
    },
  },
  {
    id: "web", name: "Web Development", slug: "web-development",
    description: "For web app hackathons. Includes frontend, backend, and deployment planning.",
    category: "web", tags: ["frontend", "backend", "fullstack"], featured: true, builtIn: true,
    config: {
      sections: ["objectives", "milestones", "deliverables", "requirements"],
      deliverables: ["Frontend", "Backend", "API", "Database Schema", "Deployment", "README"],
      checklist: ["API designed", "Database modeled", "Frontend built", "Deployed", "Tested"],
      tags: ["web", "fullstack"],
    },
  },
  {
    id: "game-jam", name: "Game Jam", slug: "game-jam",
    description: "Built for game development jams. Focus on assets, mechanics, and playtesting.",
    category: "game_jam", tags: ["game", "unity", "unreal"], featured: false, builtIn: true,
    config: {
      sections: ["objectives", "milestones", "deliverables", "risks"],
      deliverables: ["Game Build", "Source Code", "Assets", "Trailer", "Screenshots", "README"],
      checklist: ["Core mechanic implemented", "Assets created", "Gameplay tested", "Build exported"],
      tags: ["game"],
    },
  },
  {
    id: "security", name: "Cyber Security", slug: "cyber-security",
    description: "For security-focused hackathons. Includes threat modelling, vulnerability research, and defence planning.",
    category: "security", tags: ["security", "ctf"], featured: false, builtIn: true,
    config: {
      sections: ["objectives", "milestones", "deliverables", "requirements", "risks"],
      deliverables: ["Research Paper", "PoC", "Presentation", "Documentation", "Demo"],
      checklist: ["Threat model created", "Vulnerability identified", "Exploit tested", "Mitigation documented"],
      tags: ["security"],
    },
  },
  {
    id: "mobile", name: "Mobile App", slug: "mobile-app",
    description: "For mobile app hackathons. Covers iOS, Android, and cross-platform development.",
    category: "mobile", tags: ["ios", "android", "react-native", "flutter"], featured: false, builtIn: true,
    config: {
      sections: ["objectives", "milestones", "deliverables", "requirements"],
      deliverables: ["App Build", "Source Code", "Screenshots", "Demo Video", "README"],
      checklist: ["UI designed", "Core features implemented", "App tested", "Build exported"],
      tags: ["mobile"],
    },
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  general: "General", ai: "AI / ML", web: "Web Development",
  game_jam: "Game Jam", open_source: "Open Source", security: "Cyber Security",
  mobile: "Mobile App", iot: "IoT", university: "University", startup: "Startup Weekend",
};

export const INITIAL_WIZARD_STATE: WizardState = {
  step: "source", source: null, eventId: null, templateId: "general",
  cloneWorkspaceId: null, name: "", slug: "", description: "",
  organizer: "", startDate: "", endDate: "", timezone: "UTC",
};
