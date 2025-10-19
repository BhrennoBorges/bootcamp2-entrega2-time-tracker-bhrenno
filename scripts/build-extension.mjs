import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';

const root = process.cwd();
const dist = path.join(root, 'dist');

// Limpa e recria dist/
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// Verifica obrigatórios
for (const f of ['manifest.json']) {
  if (!fs.existsSync(path.join(root, f))) {
    throw new Error(`Arquivo obrigatório não encontrado: ${f}`);
  }
}

// Copia manifest e diretórios principais
fs.copyFileSync(path.join(root, 'manifest.json'), path.join(dist, 'manifest.json'));
const copyDir = (from, to) => fs.existsSync(from) && fs.cpSync(from, to, { recursive: true });

copyDir(path.join(root, 'src'),   path.join(dist, 'src'));
copyDir(path.join(root, 'icons'), path.join(dist, 'icons'));

// (Opcional) Se tiver assets separados, descomente a linha abaixo:
// copyDir(path.join(root, 'assets'), path.join(dist, 'assets'));

// Gera dist/extension.zip (sem incluir ele mesmo)
const outputZip = path.join(dist, 'extension.zip');
const output = fs.createWriteStream(outputZip);
const archive = archiver('zip', { zlib: { level: 9 } });

archive.pipe(output);
archive.glob('**/*', { cwd: dist, ignore: ['extension.zip'] });
await archive.finalize();

console.log('✅ Build gerado em dist/ e dist/extension.zip');
