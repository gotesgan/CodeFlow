import { z } from 'zod';
import fs from 'fs/promises';
import { logError, logInfo } from './logger.js';

const validateConfig = z.array(
    z.object({
        repository: z.object({
            remote_url: z.string().url(),
            local_path: z.string().min(1),
            branch: z.string().min(1),
        }),
        scripts: z.array(
            z.object({
                name: z.string().min(1),
                command: z.string().min(1),
                description: z.string().optional(),
            })
        ),
    })
);

export async function validateConfigFile() {
    try {
        const data = await fs.readFile('config.json', 'utf-8');
        const config = JSON.parse(data);
        validateConfig.parse(config);
        logInfo('Configuration is valid!');
        return config;
    } catch (e) {
        logError(`Validation failed: ${e}`);
        return [];
    }
}
