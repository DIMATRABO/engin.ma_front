import {z} from 'zod';

// Public environment variables accessible on the client
const PublicEnvSchema = z.object({
    NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
});

export type PublicEnv = z.infer<typeof PublicEnvSchema>;

// Parse once at module load; NEXT_PUBLIC_* vars are replaced at build time for client bundles
const parsed = PublicEnvSchema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export const publicEnv: PublicEnv = parsed.success ? parsed.data : {};

export function getApiBaseUrl(): string | undefined {
    const base = publicEnv.NEXT_PUBLIC_API_BASE_URL;
    if (!base) return undefined;
    // Normalize: drop trailing slashes
    return base.replace(/\/+$/, '');
}
