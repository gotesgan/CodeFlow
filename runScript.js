import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function runScript(command, workingDir) {
    try {
        console.log(`Running command: ${command}`);
        const { stdout, stderr } = await execPromise(command, { cwd: workingDir });
        if (stderr) {
            console.error(`Error running command: ${stderr}`);
        } else {
            console.log(`Output: ${stdout}`);
        }
    } catch (err) {
        console.error(`Error executing script: ${err}`);
        throw err;
    }
}
