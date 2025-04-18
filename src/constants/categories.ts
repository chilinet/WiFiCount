export const CATEGORIES = {
    ROOT: 'ROOT',
    KUNDE: 'KUNDE',
    STANDORT: 'STANDORT',
    BEREICH: 'BEREICH'
} as const;

export type Category = typeof CATEGORIES[keyof typeof CATEGORIES]; 