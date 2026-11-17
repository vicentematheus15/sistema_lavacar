import crypto from 'crypto';

// As chaves ficam no .env em base64 (uma linha só) e viram PEM aqui
const lerChave = (nome) => {
    const valor = process.env[nome];
    if (!valor) {
        throw new Error(`Variável ${nome} não definida no .env`);
    }
    return Buffer.from(valor, 'base64').toString('utf8');
};

export function cifrarCpf(cpf) {
    return crypto.publicEncrypt(
        { key: lerChave('CPF_PUBLIC_KEY'), padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
        Buffer.from(cpf, 'utf8')
    ).toString('base64');
}

export function decifrarCpf(cpfCifrado) {
    return crypto.privateDecrypt(
        { key: lerChave('CPF_PRIVATE_KEY'), padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
        Buffer.from(cpfCifrado, 'base64')
    ).toString('utf8');
}