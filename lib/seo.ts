import type {Metadata} from 'next';

export const defaultMetadata: Metadata = {
    metadataBase: new URL('https://enginchantier.ma'),
    title: {
        default: 'Enginchantier.ma',
        template: '%s | Enginchantier.ma',
    },
    description: 'JCB machine rental platform',
    applicationName: 'Enginchantier.ma',
    openGraph: {
        type: 'website',
        siteName: 'Enginchantier.ma',
    },
    twitter: {
        card: 'summary_large_image',
    },
};

export function mergeMetadata(overrides: Metadata = {}): Metadata {
    return {
        ...defaultMetadata,
        ...overrides,
        openGraph: {
            ...defaultMetadata.openGraph,
            ...overrides.openGraph,
        },
        twitter: {
            ...defaultMetadata.twitter,
            ...overrides.twitter,
        },
    };
}
