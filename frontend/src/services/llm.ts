import type { ApiMessage, LlmSettings } from '../types';
import { resolveBaseUrl, resolveModel } from './providers';

/**
 * LLM 流式调用错误
 */
export class LlmError extends Error {
  code: 'no_api_key' | 'network' | 'auth' | 'forbidden' | 'rate_limit' | 'server' | 'parse' | 'aborted' | 'unknown';
  constructor(
    code: 'no_api_key' | 'network' | 'auth' | 'forbidden' | 'rate_limit' | 'server' | 'parse' | 'aborted' | 'unknown',
    message: string
  ) {
    super(message);
    this.name = 'LlmError';
    this.code = code;
  }
}

/**
 * 获取完整的 API endpoint URL
 * 所有供应商统一拼接 {baseUrl}/v1/chat/completions
 */
function getEndpoint(settings: LlmSettings): string {
  const baseUrl = resolveBaseUrl(settings);
  // 去掉末尾斜杠
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `${cleanBase}/v1/chat/completions`;
}

/**
 * 流式聊天 - async generator
 * 使用 fetch + ReadableStream 解析 SSE
 */
export async function* streamChat(
  messages: ApiMessage[],
  settings: LlmSettings,
  signal?: AbortSignal
): AsyncGenerator<string> {
  const apiKey = settings.apiKey.trim();
  if (!apiKey) {
    throw new LlmError('no_api_key', '未配置 API Key');
  }

  const url = getEndpoint(settings);
  const model = resolveModel(settings);

  // 构建请求体,根据供应商添加搜索参数
  const requestBody: any = {
    model,
    messages,
    stream: true,
  };

  // DeepSeek 搜索支持
  if (settings.enableSearch && settings.provider === 'deepseek') {
    requestBody.web_search = true;
  }

  // Qwen 搜索支持
  if (settings.enableSearch && settings.provider === 'qwen') {
    requestBody.enable_search = true;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal,
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new LlmError('aborted', '请求已取消');
    }
    throw new LlmError('network', `无法连接服务器: ${err.message}`);
  }

  if (!response.ok) {
    const statusCode = response.status;
    let errorMessage: string;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error?.message || errorBody.message || `HTTP ${statusCode}`;
    } catch {
      errorMessage = `HTTP ${statusCode}`;
    }

    if (statusCode === 401) {
      throw new LlmError('auth', 'API Key 无效');
    } else if (statusCode === 403) {
      throw new LlmError('forbidden', 'Key 无权限访问该模型');
    } else if (statusCode === 429) {
      throw new LlmError('rate_limit', '请求过于频繁，请稍后重试');
    } else if (statusCode >= 500) {
      throw new LlmError('server', `服务暂时不可用: ${errorMessage}`);
    } else {
      throw new LlmError('unknown', errorMessage);
    }
  }

  // 检查 response.body 是否存在
  if (!response.body) {
    throw new LlmError('network', '服务器未返回数据流');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      let chunk: ReadableStreamReadResult<Uint8Array>;
      try {
        chunk = await reader.read();
      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new LlmError('aborted', '请求已取消');
        }
        // 连接中断，直接结束 generator（保留已接收内容）
        break;
      }

      if (chunk.done) break;

      buffer += decoder.decode(chunk.value, { stream: true });

      // 按行分割
      const lines = buffer.split('\n');
      // 保留最后一行（可能不完整）
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // SSE 格式: data: {...}
        if (!trimmed.startsWith('data:')) continue;

        const data = trimmed.slice(5).trim();

        // 结束标记
        if (data === '[DONE]') {
          return;
        }

        // 解析 JSON
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // 解析失败的行跳过，继续读取
          continue;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 测试连接 - 发送一个简单的请求验证 API Key
 */
export async function testConnection(settings: LlmSettings): Promise<{ success: boolean; message: string }> {
  const apiKey = settings.apiKey.trim();
  if (!apiKey) {
    return { success: false, message: '请先填写 API Key' };
  }

  const url = getEndpoint(settings);
  const model = resolveModel(settings);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
      }),
    });

    if (response.ok) {
      return { success: true, message: `连接成功 - ${model}` };
    }

    const statusCode = response.status;
    let errorMessage: string;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error?.message || `HTTP ${statusCode}`;
    } catch {
      errorMessage = `HTTP ${statusCode}`;
    }

    if (statusCode === 401) {
      return { success: false, message: 'API Key 无效' };
    } else if (statusCode === 403) {
      return { success: false, message: 'Key 无权限访问该模型' };
    } else if (statusCode === 429) {
      return { success: false, message: '请求过于频繁，请稍后重试' };
    } else {
      return { success: false, message: errorMessage };
    }
  } catch (err: any) {
    return { success: false, message: `无法连接: ${err.message}` };
  }
}
