/**
 * Filtro Prisma para posts visíveis ao público: com data de publicação
 * preenchida e já no passado (ou agora). Um post com `publishedAt` no
 * futuro — possível pelo date picker do admin — não é "publicado" ainda,
 * mesmo tendo o campo preenchido, por isso não basta `{ not: null }`.
 */
export function postsPublicadosWhere() {
  return { publishedAt: { lte: new Date() } };
}

/**
 * Mesma regra acima, mas em memória — para checar um único post já
 * carregado (ex.: `findUnique`) em vez de filtrar uma lista no banco.
 *
 * Predicado genérico (em vez de fixado no tipo `Post` do Prisma) para que o
 * `if (!estaPublicado(post)) ...` narrowe `post.publishedAt` para `Date` no
 * restante da função, sem precisar de um segundo `!post.publishedAt` manual.
 */
export function estaPublicado<T extends { publishedAt: Date | null }>(
  post: T | null | undefined,
): post is T & { publishedAt: Date } {
  return Boolean(post?.publishedAt && post.publishedAt.getTime() <= Date.now());
}
