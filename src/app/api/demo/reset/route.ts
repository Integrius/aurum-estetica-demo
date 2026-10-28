import { timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Comparação em tempo constante: um `!==` normal sai mais cedo no primeiro
// byte diferente, o que vaza (por tempo de resposta) quantos caracteres do
// segredo o requisitante já acertou. `timingSafeEqual` exige buffers do
// mesmo tamanho, então o tamanho é checado antes — e essa checagem em si não
// vaza segredo, só o tamanho esperado do header (já conhecido: "Bearer " + hex).
function comparaEmTempoConstante(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

/**
 * Limpeza do demo.
 *
 * Prospects testam o agendamento durante as reuniões. Sem esta rotina o painel
 * admin fica impresentável em poucas semanas.
 *
 * Apaga SÓ agendamentos e clientes criados há mais de 24h. Serviços,
 * profissionais, horários de trabalho, posts e casos de resultado nunca são
 * tocados — eles são o conteúdo da demonstração.
 */
export async function POST(request: Request) {
  const segredo = process.env.DEMO_RESET_SECRET;
  const cabecalho = request.headers.get('authorization');

  if (!segredo || !cabecalho || !comparaEmTempoConstante(cabecalho, `Bearer ${segredo}`)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const limite = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const agendamentos = await prisma.appointment.deleteMany({
    where: { createdAt: { lt: limite } },
  });
  // Clientes são apagados depois: agendamento tem FK para cliente.
  const clientes = await prisma.client.deleteMany({
    where: { createdAt: { lt: limite }, appointments: { none: {} } },
  });

  return NextResponse.json({
    agendamentos: agendamentos.count,
    clientes: clientes.count,
    limite: limite.toISOString(),
  });
}
