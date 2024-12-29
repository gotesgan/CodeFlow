import simpleGit from 'simple-git';
import nodemailer from 'nodemailer';

const git = simpleGit();

// Function to send email notification
async function sendConflictNotificationEmail() {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Replace with your email provider
        auth: {
            user: 'errorincicd@gmail.com', // Replace with your email
            pass: '1@errorincicd'    // Replace with your email password or use OAuth
        },
    });

    const mailOptions = {
        from: 'errorincicd@gmail.com',
        to: 'shantanugote82@gmail.com', // Admin's email
        subject: 'Merge Conflict Notification',
        text: 'The automated merge conflict resolution process has failed after multiple attempts. Please resolve the conflict manually.',
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Conflict notification email sent to administrator!');
    } catch (error) {
        console.error('Failed to send conflict notification email:', error);
    }
}

// Function to resolve conflicts automatically with retry logic
async function resolveConflictAndRetry(git, localPath, branch, retries = 3) {
    let attempts = 0;
    while (attempts < retries) {
        try {
            console.log(`Attempt ${attempts + 1} to resolve conflict`);
            // Pull with a strategy that resolves conflicts automatically by favoring remote changes
            await git.pull('origin', branch, { '--strategy': 'recursive', '--strategy-option': 'theirs' });
            console.log('Conflict resolved successfully!');
            return true;
        } catch (error) {
            console.error('Conflict resolution failed:', error);
            attempts++;
            if (attempts < retries) {
                console.log(`Retrying... (${attempts} of ${retries})`);
            } else {
                console.error(`All ${retries} attempts to resolve the conflict have failed.`);
                await sendConflictNotificationEmail(); // Notify the administrator after retries fail
                return false;
            }
        }
    }
}

// Function to check if there are new commits on a given branch.
export async function checkForCommits(localPath, branch) {
    try {
        // Change to the specified local repository directory
        await git.cwd(localPath);

        // Fetch the latest changes from the remote repository
        await git.fetch('origin');

        // Get the latest commit log for both local and remote branches
        const remoteLog = await git.log([`origin/${branch}`, '-n', '1']);
        const localLog = await git.log([branch, '-n', '1']);

        // If commit hashes are different, there are new commits on the remote branch
        if (remoteLog.latest.hash !== localLog.latest.hash) {
            console.log(`New commits found on branch ${branch}!`);

            // Resolve conflicts with retry logic
            const conflictResolved = await resolveConflictAndRetry(git, localPath, branch);
            if (!conflictResolved) {
                return false; // If conflict resolution fails, skip further processing
            }
            return true; // New commits detected and conflicts resolved
        }

        console.log(`No new commits on branch ${branch}.`);
        return false; // No new commits
    } catch (error) {
        console.error(`Error checking commits for branch ${branch}:`, error);
        return false;
    }
}
