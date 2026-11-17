import crypto from 'crypto';
import fs from 'fs';

const caminho = '.env';

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const paraBase64 = (pem) => Buffer.from(pem, 'utf8').toString('base64');

// Remove as linhas antigas das chaves (se existirem) e mantém o resto do .env
const atual = fs.existsSync(caminho) ? fs.readFileSync(caminho, 'utf8') : '';
const mantidas = atual
    .split(/\r?\n/)
    .filter((linha) => !linha.startsWith('CPF_PUBLIC_KEY=') && !linha.startsWith('CPF_PRIVATE_KEY='));

while (mantidas.length && mantidas[mantidas.length - 1].trim() === '') mantidas.pop();

mantidas.push(`CPF_PUBLIC_KEY=${paraBase64(publicKey)}`);
mantidas.push(`CPF_PRIVATE_KEY=${paraBase64(privateKey)}`);

fs.writeFileSync(caminho, mantidas.join('\n') + '\n');
console.log('Chaves geradas e salvas no .env (CPF_PUBLIC_KEY e CPF_PRIVATE_KEY).');