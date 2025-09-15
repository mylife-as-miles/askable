export type ChatModel = {
  logo: string;
  title: string;
  model: string;
  slug: string;
  isDefault?: boolean;
  hasReasoning?: boolean;
  contextLength: number;
};

export const CHAT_MODELS: ChatModel[] = [
  {
    logo: 'https://cdn.prod.website-files.com/650c3b59079d92475f37b68f/6798c7d256b428d5c7991fef_66f41918314a4184b51788ed_meta-logo.png',
    title: 'Llama 3.3 70B',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    slug: 'llama-3-3',
    isDefault: true,
    contextLength: 128000,
  },
  {
    logo: 'https://cdn.prod.website-files.com/650c3b59079d92475f37b68f/6798c7d11669ad7315d427af_66f41a324f1d713df2cbfbf4_deepseek-logo.webp',
    title: 'DeepSeek-V3.1',
    model: 'deepseek/deepseek-chat-v3.1:free',
    slug: 'deepseek-v3-1',
    contextLength: 128000,
  },
  {
    logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/openai.png',
    title: 'gpt-oss-120b',
    model: 'openai/gpt-oss-120b:free',
    slug: 'gpt-oss-120b-free',
    contextLength: 128000,
  },
  {
    logo: '/python.svg',
    title: 'GLM-4.5-Air',
    model: 'z-ai/glm-4.5-air:free',
    slug: 'glm-4-5-air',
    contextLength: 128000,
  },
  {
    logo: 'https://cdn.prod.website-files.com/650c3b59079d92475f37b68f/6798c7d1ee372a0b8f8122f4_66f41a073403f9e2b7806f05_qwen-logo.webp',
    title: 'Qwen3-Coder',
    model: 'qwen/qwen3-coder:free',
    slug: 'qwen3-coder-free',
    contextLength: 262144,
  },
  {
    logo: '/python.svg',
    title: 'Kimi K2 Instruct',
    model: 'moonshotai/kimi-k2:free',
    slug: 'kimi-k2-instruct',
    contextLength: 256000,
  },
];
