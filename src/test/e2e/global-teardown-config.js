const fs = require('fs');
const path = require('path');

const countsFilePath = path.join(__dirname, 'loginCounts.json');

module.exports = async () => {
  let totalLogins = 0;
  let loginCounts = {};

  try {
    if (fs.existsSync(countsFilePath)) {
      const data = fs.readFileSync(countsFilePath, 'utf8');
      loginCounts = JSON.parse(data);

      for (const file in loginCounts) {
        totalLogins += loginCounts[file];
      }
    }
  } catch (error) {
    console.error('Error reading login counts in global teardown:', error);
  }

  if (totalLogins > 0) {
    console.log('\n=== Total Logins Across All Test Files ===');
    console.log(`  Total Logins: ${totalLogins}`);
  }

  try {
    if (fs.existsSync(countsFilePath)) {
      fs.unlinkSync(countsFilePath);
      console.log('loginCounts.json deleted successfully.');
    }
  } catch (error) {
    console.error('Error deleting loginCounts.json:', error);
  }
};
