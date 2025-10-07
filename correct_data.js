const fs = require('fs');

const filePath = 'src/utils/test_dataset_cleaned_final.json';

const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

data.forEach(job => {
  if (job.salary_range && typeof job.salary_range === 'string' && job.salary_range.startsWith('window.__remixContext')) {
    job.salary_range = null;
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Data corrected - invalid salary_ranges set to null');