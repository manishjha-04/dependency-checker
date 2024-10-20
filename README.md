# Dependency Version Checker

A CLI tool that scans your project for outdated dependencies and generates an Excel report highlighting major version updates.

## Features

- 📊 Scans all `package.json` files in your project and sub-directories
- 🔍 Checks current versions against latest npm registry versions
- 📑 Generates Excel report with two sheets:
  - "All Dependencies": Complete list of all dependencies
  - "Major Updates": Dependencies with major version changes
- ⏳ Real-time progress indicators

## Installation

```bash
# Clone the repository
git clone https://github.com/manishjha-04/dependency-checker.git

# Install dependencies
npm install
```

## Usage

Run in your project directory:
```bash
node dependency-checker.js [path]
```
- `[path]`: Optional. Path to your project directory. Defaults to current directory.

## Output

Generates an Excel file named `dependency-report-[date].xlsx` containing:

1. **All Dependencies Sheet**
   - File path
   - Package name
   - Current version
   - Latest version
   - Version difference
   - Package description
   - Homepage
   - Repository URL

2. **Major Updates Sheet**
   - Same columns as above, but only shows packages with major version updates
   - If no major updates found, displays "No major updates found"

## Example

```bash
# Run in current directory
node dependency-checker.js

# Run in specific project
node dependency-checker.js /path/to/your/project
```

## Requirements

- Node.js
- Required npm packages:
  - `xlsx`
  - `axios`
  - `glob`
  - `semver`
  - `ora`