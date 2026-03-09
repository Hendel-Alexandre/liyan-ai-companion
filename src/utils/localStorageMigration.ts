const MIGRATION_KEY = 'liyan_migrated_to_api';

export function isMigrated(): boolean {
    return localStorage.getItem(MIGRATION_KEY) === 'true';
}

export async function runMigrationIfNeeded(_userId: string) {
    if (isMigrated()) return;
    localStorage.setItem(MIGRATION_KEY, 'true');
}
