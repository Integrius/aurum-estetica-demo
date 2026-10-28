/**
 * Grid do Instagram. Em um site real, isto viria da API do Instagram ou de um
 * serviço de curadoria. Aqui é estático de propósito: a demo não deve depender
 * de token de terceiro que expira e quebra a página na frente do cliente.
 */
export interface InstagramPost {
  imagem: string;
  alt: string;
  legenda: string;
}

export const INSTAGRAM_POSTS: InstagramPost[] = [
  { imagem: '/img/instagram/01.webp', alt: 'Detalhe de um protocolo facial em andamento', legenda: 'Protocolo facial avançado, sessão 3 de 5.' },
  { imagem: '/img/instagram/02.webp', alt: 'Ambiente da recepção da clínica', legenda: 'Quem chega cedo pega o melhor café.' },
  { imagem: '/img/instagram/03.webp', alt: 'Produtos de skincare organizados em bancada', legenda: 'O que a gente indica para casa é tão importante quanto a sessão.' },
  { imagem: '/img/instagram/04.webp', alt: 'Profissional preparando o equipamento', legenda: 'Bastidores de uma sessão de radiofrequência.' },
  { imagem: '/img/instagram/05.webp', alt: 'Detalhe de textura de pele saudável', legenda: 'Constância vence intensidade. Sempre.' },
  { imagem: '/img/instagram/06.webp', alt: 'Sala de atendimento com iluminação suave', legenda: 'Sala 2, pronta para o próximo atendimento.' },
];
