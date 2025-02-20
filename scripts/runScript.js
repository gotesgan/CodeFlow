import { exec } from 'child_process';
import { logInfo, logError } from '../utils/logger.js';

export async function runScript(command, cwd) {
    return new Promise((resolve, reject) => {
        logInfo(`Running script: ${command}`);
        const process = exec(command, { cwd });

        process.stdout.on('data', (data) => logInfo(`[SCRIPT]: ${data}`));
        process.stderr.on('data', (data) => logError(`[SCRIPT ERROR]: ${data}`));

        process.on('exit', (code) => {
            if (code === 0) {
                logInfo(`Script executed successfully: ${command}`);
                resolve();
            } else {
                logError(`Script failed with code ${code}: ${command}`);
                reject(new Error(`Script failed with code ${code}`));
            }
        });
    });
}
