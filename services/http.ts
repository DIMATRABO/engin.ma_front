import {ApiError, ApiResponse} from '@/types/api';
import {getApiBaseUrl} from '@/lib/env';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions<TBody = unknown> = {
    path: string; // absolute URL or relative path like "/contact"
    method?: HttpMethod;
    query?: Record<string, string | number | boolean | undefined>;
    headers?: Record<string, string>;
    body?: TBody;
    // Whether to send credentials; defaults to 'same-origin'
    credentials?: RequestCredentials;
    // Override base URL resolution, e.g., when path is relative and you want custom base
    baseUrlOverride?: string;
};

function buildUrl(path: string, query?: RequestOptions['query'], baseOverride?: string): string {
    const isAbsolute = /^https?:\/\//i.test(path);
    const base = baseOverride ?? getApiBaseUrl();

    if (!isAbsolute) {
        // Allow calls to our own Next.js API routes (same-origin) without prepending external API base
        if (path.startsWith('/api/')) {
            // leave path as-is so fetch will hit the Next.js route on the current origin
        } else {
            if (!base) {
                throw new Error('API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL in your env.');
            }
            // Ensure single slash between base and path
            path = `${base}${path.startsWith('/') ? '' : '/'}${path}`;
        }
    }

    if (!query) return path;

    const url = new URL(path);
    Object.entries(query).forEach(([k, v]) => {
        if (v === undefined) return;
        url.searchParams.set(k, String(v));
    });
    return url.toString();
}

function isFormData(val: unknown): val is FormData {
    return typeof FormData !== 'undefined' && val instanceof FormData;
}

async function request<TResp = unknown, TBody = unknown>(opts: RequestOptions<TBody>): Promise<ApiResponse<TResp>> {
    const {path, method = 'GET', query, headers, body, credentials = 'same-origin', baseUrlOverride} = opts;
    const url = buildUrl(path, query, baseUrlOverride);

    const usingFormData = isFormData(body as unknown);

    // Prepare body without using any
    let payloadBody: BodyInit | undefined = undefined;
    if (body != null) {
        if (usingFormData) {
            payloadBody = body as unknown as FormData;
        } else if (typeof body === 'string') {
            payloadBody = body;
        } else {
            payloadBody = JSON.stringify(body as unknown);
        }
    }

    function getActiveLocale(): string | undefined {
        try {
            if (typeof document !== 'undefined') {
                const lang = document.documentElement?.getAttribute('lang') || ''
                if (lang) return lang
                const m = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/)
                if (m && m[1]) return decodeURIComponent(m[1])
            }
            // Fallback to navigator.language
            if (typeof navigator !== 'undefined' && navigator.language) {
                const first = navigator.language.split(',')[0]?.trim()
                if (first) return first
            }
        } catch {
            // ignore
        }
        return undefined
    }

    const activeLocale = getActiveLocale()

    const init: RequestInit = {
        method,
        headers: {
            // Only set JSON content-type when sending a JSON body
            ...(!usingFormData && body != null ? {'Content-Type': 'application/json'} : {}),
            // Attach active locale if not explicitly provided
            ...(activeLocale && !(headers && 'Accept-Language' in headers) ? {'Accept-Language': activeLocale} : {}),
            ...headers,
        },
        credentials,
        ...(payloadBody !== undefined ? {body: payloadBody} : {}),
        // Opt-in caching can be added per-call in the future
    };

    const res = await fetch(url, init);
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    let parsed: unknown = undefined;
    try {
        parsed = isJson ? await res.json() : await res.text();
    } catch {
        // ignore body parse errors
    }

    if (!res.ok) {
        const message = (() => {
            if (parsed && typeof parsed === 'object' && 'message' in parsed) {
                const m = (parsed as { message?: unknown }).message;
                return typeof m === 'string' ? m : undefined;
            }
            return undefined;
        })() ?? `Request failed with status ${res.status}`;

        throw new ApiError(message, res.status, parsed);
    }

    return {data: parsed as TResp, status: res.status, headers: res.headers};
}

export const http = {
    get: <TResp = unknown>(path: string, options: Omit<RequestOptions, 'path' | 'method' | 'body'> = {}) =>
        request<TResp>({path, method: 'GET', ...options}),
    post: <TResp = unknown, TBody = unknown>(path: string, body?: TBody, options: Omit<RequestOptions<TBody>, 'path' | 'method' | 'body'> = {}) =>
        request<TResp, TBody>({path, method: 'POST', body, ...options}),
    put: <TResp = unknown, TBody = unknown>(path: string, body?: TBody, options: Omit<RequestOptions<TBody>, 'path' | 'method' | 'body'> = {}) =>
        request<TResp, TBody>({path, method: 'PUT', body, ...options}),
    patch: <TResp = unknown, TBody = unknown>(path: string, body?: TBody, options: Omit<RequestOptions<TBody>, 'path' | 'method' | 'body'> = {}) =>
        request<TResp, TBody>({path, method: 'PATCH', body, ...options}),
    delete: <TResp = unknown, TBody = unknown>(path: string, body?: TBody, options: Omit<RequestOptions<TBody>, 'path' | 'method' | 'body'> = {}) =>
        request<TResp, TBody>({path, method: 'DELETE', body, ...options}),
};
