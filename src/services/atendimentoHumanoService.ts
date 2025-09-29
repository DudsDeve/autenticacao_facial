import axios from 'axios';

export async function assumirAtendimento(usuario: string, mensagem: string) {
    const response = await axios.post(
        'https://n8n.auredigital.com.br/webhook/assumir-atendimento',
        {
            assumidoPor: usuario,
            mensagem: mensagem,
        }
    );
    return response.data;
}
