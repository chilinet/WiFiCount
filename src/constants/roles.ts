export const ROLES = {
    SUPERADMIN: 'SUPERADMIN',
    ADMIN: 'ADMIN',
    USER: 'USER'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES]; 