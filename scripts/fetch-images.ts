/**
 * Baixa e converte as imagens do Unsplash para public/img/.
 * Rodar com: npx tsx scripts/fetch-images.ts
 *
 * As URLs abaixo são fotos de licença livre do Unsplash. Ao revender o
 * template, troque por fotos reais do cliente mantendo os mesmos caminhos.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const RAIZ = join(process.cwd(), 'public', 'img');

interface Alvo {
  destino: string;
  url: string;
  largura: number;
  altura: number;
}

const ALVOS: Alvo[] = [
  { destino: 'hero/principal.webp', url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=2400&q=90', largura: 1920, altura: 1080 },
  { destino: 'hero/servicos.webp', url: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=2400&q=90', largura: 1920, altura: 823 },
  { destino: 'hero/sobre.webp', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=2400&q=90', largura: 1920, altura: 823 },
  { destino: 'hero/contato.webp', url: 'https://images.unsplash.com/photo-1556760544-74068565f05c?w=2400&q=90', largura: 1920, altura: 823 },

  { destino: 'ambiente/recepcao.webp', url: 'https://images.unsplash.com/photo-1758448500688-3ababa93fd67?w=1600&q=90', largura: 1200, altura: 1500 },
  { destino: 'ambiente/sala.webp', url: 'https://images.unsplash.com/photo-1713085085470-fba013d67e65?w=1600&q=90', largura: 1200, altura: 1500 },
  { destino: 'ambiente/detalhe.webp', url: 'https://images.unsplash.com/photo-1775500835259-d3b3f6d6e2f2?w=1600&q=90', largura: 1200, altura: 1500 },
  { destino: 'ambiente/bancada.webp', url: 'https://images.unsplash.com/photo-1540177656454-3f6c4547bed1?w=1600&q=90', largura: 1200, altura: 800 },
  { destino: 'ambiente/espera.webp', url: 'https://images.unsplash.com/photo-1718049719688-764249c6800d?w=1600&q=90', largura: 1200, altura: 800 },
  { destino: 'ambiente/fachada.webp', url: 'https://images.unsplash.com/photo-1778034758168-c7fd662e114e?w=1600&q=90', largura: 1200, altura: 800 },

  { destino: 'equipe/helena.webp', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1000&q=90', largura: 800, altura: 1067 },
  { destino: 'equipe/marina.webp', url: 'https://images.unsplash.com/photo-1604072366595-e75dc92d6bdc?w=1000&q=90', largura: 800, altura: 1067 },
  { destino: 'equipe/beatriz.webp', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1000&q=90', largura: 800, altura: 1067 },
  { destino: 'equipe/carolina.webp', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000&q=90', largura: 800, altura: 1067 },
  { destino: 'equipe/tatiane.webp', url: 'https://images.unsplash.com/photo-1569925444984-9e2e5fc3d1fb?w=1000&q=90', largura: 800, altura: 1067 },
  { destino: 'equipe/rafael.webp', url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1000&q=90', largura: 800, altura: 1067 },

  { destino: 'diario/sessoes.webp', url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1600&q=90', largura: 1200, altura: 675 },
  { destino: 'diario/skincare.webp', url: 'https://images.unsplash.com/photo-1748543668646-e81cda0890f3?w=1600&q=90', largura: 1200, altura: 675 },
  { destino: 'diario/inverno.webp', url: 'https://images.unsplash.com/photo-1693004927824-f2623bbedc8b?w=1600&q=90', largura: 1200, altura: 675 },
  { destino: 'diario/injetaveis.webp', url: 'https://images.unsplash.com/photo-1746708810803-722593e53772?w=1600&q=90', largura: 1200, altura: 675 },

  { destino: 'instagram/01.webp', url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1000&q=90', largura: 800, altura: 800 },
  { destino: 'instagram/02.webp', url: 'https://images.unsplash.com/photo-1731514771613-991a02407132?w=1000&q=90', largura: 800, altura: 800 },
  { destino: 'instagram/03.webp', url: 'https://images.unsplash.com/photo-1748543668643-1ada33167539?w=1000&q=90', largura: 800, altura: 800 },
  { destino: 'instagram/04.webp', url: 'https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=1000&q=90', largura: 800, altura: 800 },
  { destino: 'instagram/05.webp', url: 'https://images.unsplash.com/photo-1552693673-1bf958298935?w=1000&q=90', largura: 800, altura: 800 },
  { destino: 'instagram/06.webp', url: 'https://images.unsplash.com/photo-1761718209835-c8586b7dcac0?w=1000&q=90', largura: 800, altura: 800 },
];

async function baixar(alvo: Alvo) {
  const resposta = await fetch(alvo.url);
  if (!resposta.ok) {
    throw new Error(`Falhou ${alvo.destino}: HTTP ${resposta.status}`);
  }
  const origem = Buffer.from(await resposta.arrayBuffer());
  const saida = await sharp(origem)
    .resize(alvo.largura, alvo.altura, { fit: 'cover', position: 'attention' })
    .webp({ quality: 82 })
    .toBuffer();

  const caminho = join(RAIZ, alvo.destino);
  await mkdir(dirname(caminho), { recursive: true });
  await writeFile(caminho, saida);
  console.log(`✓ ${alvo.destino} — ${(saida.length / 1024).toFixed(0)} KB`);
}

async function main() {
  for (const alvo of ALVOS) {
    await baixar(alvo);
  }

  // Open Graph derivado do hero, em JPEG (alguns crawlers ainda tropeçam em WebP).
  const heroOg = await sharp(join(RAIZ, 'hero/principal.webp'))
    .resize(1200, 630, { fit: 'cover' })
    .jpeg({ quality: 86 })
    .toBuffer();
  await writeFile(join(RAIZ, 'og-default.jpg'), heroOg);
  console.log('✓ og-default.jpg');
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
