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
    logo: 'https://cdn.prod.website-files.com/650c3b59079d92475f37b68f/6798c7d1ee372a0b8f8122f4_66f41a073403f9e2b7806f05_qwen-logo.webp',
    title: 'Qwen 3 Coder',
    slug: 'qwen-3-coder-480b',
    model: 'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8',
    isDefault: true,
    contextLength: 131072,
  },
  {
    logo: 'https://cdn.prod.website-files.com/650c3b59079d92475f37b68f/6798c7d11669ad7315d427af_66f41a324f1d713df2cbfbf4_deepseek-logo.webp',
    title: 'DeepSeek V3.1',
    slug: 'deepseek-v3',
    model: 'deepseek-ai/DeepSeek-V3.1',
    contextLength: 128000,
  },
  {
    logo: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/openai.png',
    title: 'GPT OSS 120B',
    model: 'openai/gpt-oss-120b',
    slug: 'gpt-oss-120b',
    contextLength: 128000,
  },
  {
    logo: 'https://cdn.prod.website-files.com/650c3b59079d92475f37b68f/6798c7d256b428d5c7991fef_66f41918314a4184b51788ed_meta-logo.png',
    title: 'Llama 3.3 70B',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    slug: 'llama-3-3',
    isDefault: true,
    contextLength: 128000,
  },
];
