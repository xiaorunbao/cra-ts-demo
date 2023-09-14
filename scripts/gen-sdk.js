const fs = require('fs');
const http = require('http');
const path = require('path');

const generator = require('@esunny/openapi-ts-gen');

const OUT_DIR = path.join(__dirname, '..', 'src', 'sdk');

function download(dest, url) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    http
      .get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.info(`  - Api file saved at ${dest}`);
          resolve(file.path);
        });
      })
      .on('error', (err) => {
        console.error(`  - download failed: ${err.message}`);
        reject(err);
      });
  });
}

async function GenPetStore() {
  const filepath = path.join(process.cwd(), 'openapi.yaml');
  await download(filepath, 'http://localhost:3566/api-yaml');

  const petStoreOut = path.join(OUT_DIR, 'petstore');

  const result = generator.gen({
    name: 'petstore',
    input: filepath,
  });

  fs.mkdirSync(petStoreOut, { recursive: true });

  result.files.forEach(({ filename, content }) => {
    fs.writeFileSync(path.join(petStoreOut, filename), content);
  });

  fs.rmSync(filepath);
}

async function main() {
  await GenPetStore();
}

main();
