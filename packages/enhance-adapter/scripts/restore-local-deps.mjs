import fsExtra from 'fs-extra';
import path from 'path';

async function restoreLocalPath() {
  const filePath = path.join(process.cwd(), 'package.json');
  const toFilePath = path.join(process.cwd(), 'package2.json');

  await fsExtra.remove(filePath);
  await fsExtra.move(toFilePath, filePath);
  await fsExtra.remove(toFilePath);
}

restoreLocalPath();
