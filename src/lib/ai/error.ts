export function serializeAIError(err: any): any {
  // AI SDK provider errors often carry status and cause; preserve as much as possible.
  const base = {
    name: err?.name,
    message: err?.message,
    stack: err?.stack,
    status: err?.status ?? err?.statusCode,
    code: err?.code ?? err?.error?.code,
    type: err?.type ?? err?.error?.type,
    data: err?.data,
  };

  // Some providers attach a Response-like object; try to extract basic info
  const resp = err?.response;
  if (resp) {
    return {
      ...base,
      response: {
        status: resp.status,
        statusText: resp.statusText,
        headers:
          typeof resp.headers?.forEach === 'function'
            ? Object.fromEntries(Array.from(resp.headers.entries()))
            : undefined,
      },
      cause: serializeAIError(err?.cause),
    };
  }

  return {
    ...base,
    cause: err?.cause ? { name: err.cause.name, message: err.cause.message, stack: err.cause.stack } : undefined,
  };
}
