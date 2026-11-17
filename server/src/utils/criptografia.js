import crypto from 'crypto';

const publica = () => process.env.CPF_PUBLIC_KEY.replace(/\\n/g, '\n');
const privada = () => process.env.CPF_PRIVATE_KEY.replace(/\\n/g, '\n');

export function cifrarCpf(cpf) {
    return crypto.publicEncrypt(
        { key: publica(), padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
        Buffer.from(cpf, 'utf8')
    ).toString('base64');
}

export function decifrarCpf(cpfCifrado) {
    return crypto.privateDecrypt(
        { key: privada(), padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
        Buffer.from(cpfCifrado, 'base64')
    ).toString('utf8');
}