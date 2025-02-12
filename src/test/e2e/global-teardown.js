// global-teardown.js
const fs = require('fs');
const path = require('path');

const countsFilePath = path.join(__dirname, 'loginCounts.json');

module.exports = async () => {
  const chalk = (await import('chalk')).default; // Dynamic import
  let totalLogins = 0;

  try {
    // Check if the file exists *before* trying to read it.
    if (fs.existsSync(countsFilePath)) {
      const data = fs.readFileSync(countsFilePath, 'utf8');
      const loginCounts = JSON.parse(data);
      const colors =  ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan'];

      console.log(chalk.bold('\n=== Login Counts Per File ==='));
      for (const file in loginCounts) {
        // Use hasOwnProperty to avoid iterating over inherited properties
        if (loginCounts.hasOwnProperty(file)) {
          const baseFilename = path.basename(file);
          const colorIndex = stringHash(baseFilename) % colors.length;
          const color = colors[colorIndex];
          console.log(chalk[color](`  ${file}: ${loginCounts[file]}`));
          totalLogins += loginCounts[file];
        }
      }

      console.log(chalk.bold('\n=== Total Logins Across All Test Files ==='));
      console.log(chalk.green(`  Total Logins: ${totalLogins}`));

      // Delete the file *after* printing, and *inside* the try block.
      try {
        fs.unlinkSync(countsFilePath);
        console.log(chalk.gray('loginCounts.json deleted successfully.'));
      } catch (deleteError) {
        console.error(chalk.red("Error deleting loginCounts.json:", deleteError));
      }

    } else {
      console.log(chalk.yellow("loginCounts.json not found. No logins to report."));
    }
  } catch (error) {
    console.error(chalk.red("Error during global teardown:", error));
  }
};

//Gets a consistent, unique colour
function stringHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to a 32-bit integer
  }
  return Math.abs(hash); // Ensure the hash is positive
}
