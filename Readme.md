Here's the documentation in a simpler, more straightforward format:

---

# CI/CD Automation Script Documentation

This script automates the CI/CD pipeline by:
1. Cloning repositories if they are not already present locally.
2. Checking for new commits on a specified branch.
3. Running scripts when new commits are found.
4. Continuously checking for updates at regular intervals (e.g., every 10 minutes).
5. Resolving conflicts and retrying the resolution. If it fails multiple times, it sends an email to the administrator.

## Features:
- **Clone Repositories**: If the repository doesn't exist locally, it will be cloned.
- **Commit Check**: The script checks if there are new commits on the specified branch of the repository.
- **Run Scripts**: If new commits are found, the scripts defined in the configuration are executed.
- **Retry on Conflict**: The script tries to resolve conflicts multiple times. If it can't, it will notify the admin via email.
- **Regular Check Intervals**: The script checks for new commits at regular intervals (e.g., every 10 minutes).

## Prerequisites:
Make sure you have the following installed:
- **Node.js**: Required to run the script.
- **simple-git**: Library to interact with Git repositories.
- **zod**: Used to validate the configuration file.
- **fs/promises**: To handle asynchronous file operations.

To install the dependencies, run:
```bash
npm install simple-git zod fs
```

## File Structure:
- **`index.js`**: Main file that processes repositories and runs the CI/CD pipeline.
- **`cloneRepository.js`**: Clones the repositories.
- **`runScript.js`**: Executes the specified scripts when new commits are found.
- **`checkForNewCommits.js`**: Checks for new commits in the repository.
- **`validation.js`**: Validates the configuration file.

## Configuration:

### `config.json`
This file contains the repositories and the scripts to be executed.

Example:

```json
[
    {
        "repository": {
            "remote_url": "https://github.com/example/repo.git",
            "local_path": "/path/to/local/repo",
            "branch": "main"
        },
        "scripts": [
            {
                "name": "Build Script",
                "command": "npm run build",
                "description": "Builds the project."
            },
            {
                "name": "Deploy Script",
                "command": "npm run deploy",
                "description": "Deploys the project."
            }
        ]
    }
]
```

### Configuration Fields:
- `remote_url`: The URL of the remote repository.
- `local_path`: The local path where the repository will be cloned.
- `branch`: The branch to check for new commits.
- `scripts`: An array of scripts to execute when new commits are found.
    - `name`: The name of the script.
    - `command`: The command to run the script.
    - `description`: A brief description of the script (optional).

## Key Functions:

### `sleep(ms)`
A helper function that pauses the script for a given time (in milliseconds).

```js
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

### `processRepositories(configList)`
This function processes each repository:
1. Clones the repository if it doesn’t exist locally.
2. Checks for new commits on the specified branch.
3. Executes the defined scripts if new commits are found.

```js
async function processRepositories(configList) {
    for (const config of configList) {
        const { remote_url, local_path, branch } = config.repository;
        try {
            // Clone repository if not found locally
            if (!fs.existsSync(local_path)) {
                await cloneRepository(remote_url, local_path);
            }
            
            // Check for new commits
            const newCommits = await checkForCommits(local_path, branch);
            
            // Execute scripts if new commits
            if (newCommits) {
                for (const script of config.scripts) {
                    await runScript(script.command, local_path);
                }
            }
        } catch (error) {
            console.error("Error processing repository:", error);
        }
    }
}
```

### `main()`
This function runs the script:
1. Loads the configuration file.
2. Starts an infinite loop to check for new commits at regular intervals (e.g., every 10 minutes).

```js
async function main() {
    try {
        const configList = await validateConfigFile(); // Load configuration
        if (!configList || configList.length === 0) {
            console.error("No valid configurations found!");
            return;
        }

        // Infinite loop to run the process continuously
        while (true) {
            console.log("Starting new check cycle...");
            await processRepositories(configList);

            console.log("Sleeping for 10 minutes...");
            await sleep(600000); // 600000 ms = 10 minutes
        }
    } catch (e) {
        console.error("Main function encountered an error:", e);
    }
}
```

### `checkForCommits(localPath, branch)`
This function checks if there are new commits on the specified branch.

```js
export async function checkForCommits(localPath, branch) {
    try {
        await git.cwd(localPath);
        await git.fetch('origin');
        
        const branches = await git.branch();
        if (!branches.all.includes(branch)) {
            console.error(`Branch ${branch} does not exist locally.`);
            return false;
        }
        
        const remoteLog = await git.log([`origin/${branch}`, '-n', '1']);
        const localLog = await git.log([branch, '-n', '1']);
        
        if (remoteLog.latest.hash !== localLog.latest.hash) {
            console.log(`New commits found on branch ${branch}!`);
            return true; // New commits detected
        }
        console.log(`No new commits on branch ${branch}.`);
        return false; // No new commits
    } catch (error) {
        console.error(`Error checking commits for branch ${branch}:`, error);
        return false;
    }
}
```

## Conflict Resolution and Retry
- The script will attempt to resolve conflicts automatically. If it cannot, it will retry several times.
- If the conflict cannot be resolved, the script will send an email to the administrator.

## Error Handling:
- **Git Errors**: Catches errors related to cloning, fetching, and checking commits.
- **Configuration Errors**: Handles errors if the configuration file is missing or invalid.
- **Script Errors**: Catches errors that occur during script execution.

## Logging:
The script logs the following events:
- Starting and completing each cycle.
- Cloning the repository.
- Detecting new commits.
- Executing the scripts.
- Errors during the process.

## Conclusion:
This script automates CI/CD tasks by checking for new commits and running the associated scripts. It handles conflicts, retries resolution, and can notify administrators if something goes wrong. It runs periodically and can be extended for more complex workflows or integrations.