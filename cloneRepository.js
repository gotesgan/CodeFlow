import simpleGit from 'simple-git';

export async function cloneRepository(remoteUrl, localPath) {
    const git = simpleGit();
    try {
        console.log(`Cloning repository from ${remoteUrl} to ${localPath}...`);
        await git.clone(remoteUrl, localPath);
        console.log('Repository cloned successfully.');
    } catch (err) {
        console.error(`Error cloning repository: ${err}`);
        throw err;
    }
}
