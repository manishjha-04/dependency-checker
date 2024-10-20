const fs = require('fs');
const path = require('path');
const glob = require('glob');
const semver = require('semver');
const axios = require('axios');
const XLSX = require('xlsx');

async function checkDependencies(rootDir) {
  const packageJsonFiles = glob.sync('**/package.json', { cwd: rootDir });
  const results = [];

  for (const file of packageJsonFiles) {
    const fullPath = path.join(rootDir, file);
    const packageJson = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

    for (const [name, version] of Object.entries(dependencies)) {
      const currentVersion = semver.valid(semver.coerce(version));
      if (!currentVersion) {
        results.push({ file, name, currentVersion: version, latestVersion: 'Invalid version', diff: 'N/A', description: 'N/A', homepage: 'N/A', repository: 'N/A' });
        continue;
      }

      try {
        const latestVersion = await getLatestVersion(name);
        const diff = semver.diff(currentVersion, latestVersion);

        if (diff === 'major') {
          const info = await providePackageInfo(name, latestVersion);
          results.push({ file, name, currentVersion, latestVersion, diff, ...info });
        } else {
          results.push({ file, name, currentVersion, latestVersion, diff, description: 'N/A', homepage: 'N/A', repository: 'N/A' });
        }
      } catch (error) {
        results.push({ file, name, currentVersion, latestVersion: 'Error', diff: 'Error', description: error.message, homepage: 'N/A', repository: 'N/A' });
      }
    }
  }

  generateExcel(results);
}

async function getLatestVersion(packageName) {
  const response = await axios.get(`https://registry.npmjs.org/${packageName}`);
  return response.data['dist-tags'].latest;
}

async function providePackageInfo(packageName, version) {
  const response = await axios.get(`https://registry.npmjs.org/${packageName}/${version}`);
  const { description, homepage, repository } = response.data;
  return {
    description: description || 'N/A',
    homepage: homepage || 'N/A',
    repository: repository ? repository.url : 'N/A'
  };
}

function generateExcel(data) {
  const wb = XLSX.utils.book_new();

  // All dependencies sheet
  const wsAll = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, wsAll, "All Dependencies");

  // Major updates sheet
  const majorUpdates = data.filter(item => item.diff === 'major');
  if (majorUpdates.length > 0) {
    const wsMajor = XLSX.utils.json_to_sheet(majorUpdates);
    XLSX.utils.book_append_sheet(wb, wsMajor, "Major Updates");
    wsMajor['!cols'] = getColumnWidths();
    addAutoFilter(wsMajor);
  } else {
    const wsNoMajor = XLSX.utils.aoa_to_sheet([['No major updates found']]);
    XLSX.utils.book_append_sheet(wb, wsNoMajor, "Major Updates");
  }

  // Adjust column widths and add autofilter for All Dependencies sheet
  wsAll['!cols'] = getColumnWidths();
  addAutoFilter(wsAll);

  const fileName = `dependency-report-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  console.log(`Excel file generated: ${fileName}`);
}

function getColumnWidths() {
  return [
    { wch: 30 },  // file
    { wch: 20 },  // name
    { wch: 15 },  // currentVersion
    { wch: 15 },  // latestVersion
    { wch: 10 },  // diff
    { wch: 50 },  // description
    { wch: 30 },  // homepage
    { wch: 30 }   // repository
  ];
}

function addAutoFilter(worksheet) {
  if (worksheet['!ref']) {
    worksheet['!autofilter'] = { ref: worksheet['!ref'] };
  }
}

const rootDir = process.argv[2] || '.';
checkDependencies(rootDir);