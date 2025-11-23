import fs from 'fs/promises';
import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import { getNeo4jSession, closeNeo4j } from '../src/config/neo4j.js';

dotenv.config();

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_EXTS = new Set(['.png', '.jpg', '.jpeg', '.svg', '.webp']);
const LETTER_ORDER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function toLetterId(letter) {
  const idx = LETTER_ORDER.indexOf(letter.toUpperCase());
  return idx >= 0 ? idx + 1 : null;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function listImages(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => path.join(dir, e.name))
    .filter((p) => VALID_EXTS.has(path.extname(p).toLowerCase()));
}

async function buildLetterMap(files) {
  const map = new Map();
  for (const file of files) {
    const base = path.basename(file);
    const nameNoExt = base.replace(/\.[^.]+$/, '');
    const letter = nameNoExt.trim().toUpperCase();
    if (!letter) continue;
    map.set(letter, file);
  }
  return map;
}

async function copyFileToPublic(srcPath, destDir, destFileName) {
  await ensureDir(destDir);
  const destPath = path.join(destDir, destFileName);
  await fs.copyFile(srcPath, destPath);
  return destPath;
}

async function main() {
  const [,, sourceDirArg, explanationDirArg] = process.argv;
  if (!sourceDirArg) {
    console.error('Usage: node scripts/import_sign_letters_from_fs.js <sourceDir> [explanationDir]');
    process.exit(1);
  }

  const sourceDir = path.resolve(sourceDirArg);
  const explanationDir = explanationDirArg ? path.resolve(explanationDirArg) : null;

  const publicRoot = path.resolve(__dirname, '../public/images');
  const destMainDir = path.join(publicRoot, 'finger_alphabet');
  const destExplainDir = path.join(publicRoot, 'finger_alphabet_explanation');

  const mainFiles = await listImages(sourceDir);
  if (mainFiles.length === 0) {
    console.error('No image files found in sourceDir:', sourceDir);
    process.exit(1);
  }
  const mainMap = await buildLetterMap(mainFiles);

  let explainMap = new Map();
  if (explanationDir) {
    const explainFiles = await listImages(explanationDir);
    explainMap = await buildLetterMap(explainFiles);
  }

  const session = getNeo4jSession({ defaultAccessMode: 'WRITE' });

  try {
    console.log('Importing letters to Neo4j and copying assets...');

    for (const [letter, srcPath] of mainMap.entries()) {
      const id = toLetterId(letter) ?? 1000 + letter.charCodeAt(0); // fallback id
      const ext = path.extname(srcPath).toLowerCase();
      const destMainName = `${letter}${ext}`;
      await copyFileToPublic(srcPath, destMainDir, destMainName);

      let explanationPath = null;
      if (explainMap.has(letter)) {
        const expSrc = explainMap.get(letter);
        const expExt = path.extname(expSrc).toLowerCase();
        const destExpName = `${letter}${expExt}`;
        await copyFileToPublic(expSrc, destExplainDir, destExpName);
        explanationPath = `images/finger_alphabet_explanation/${destExpName}`;
      }

      const imagePath = `images/finger_alphabet/${destMainName}`;

      await session.run(
        'MERGE (l:SignLetter {id: toInteger($id)})\n' +
        'SET l.letter = $letter, l.image_path = $imagePath, l.explanation_path = $explanationPath',
        {
          id: Number(id),
          letter,
          imagePath,
          explanationPath
        }
      );

      console.log(`✔ Imported ${letter}: ${imagePath}${explanationPath ? ` | ${explanationPath}` : ''}`);
    }

    console.log('✅ Import finished.');
  } catch (err) {
    console.error('Import failed:', err);
    process.exitCode = 1;
  } finally {
    await session.close();
    await closeNeo4j();
  }
}

main();





















