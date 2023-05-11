import fsExtra from 'fs-extra';
import path from 'path';

async function removeLocalDeps() {
  const filePath = path.join(process.cwd(), 'package.json');
  const toFilePath = path.join(process.cwd(), 'package2.json');
  await fsExtra.copy(filePath, toFilePath);
  const content = await fsExtra.readFile(filePath, 'utf-8');
  const data = JSON.parse(content);

  if (data.devDependencies) {
    console.log(data.devDependencies);
    Object.keys(data.devDependencies).forEach((key) => {
      const value = data.devDependencies[key];
      if (value === '*') {
        delete data.devDependencies[key];
      }
    });
  }
  if (data.dependencies) {
    Object.keys(data.dependencies).forEach((key) => {
      const value = data.dependencies[key];
      if (value === '*') {
        delete data.devDependencies[key];
      }
    });
  }
  await fsExtra.writeFile(filePath, JSON.stringify(data, null, 2));
}

removeLocalDeps();
