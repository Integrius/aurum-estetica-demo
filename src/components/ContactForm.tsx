'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { whatsappLink } from '@/lib/format';

type Erros = { nome?: string; mensagem?: string };
type Status = { tipo: 'sucesso' | 'falha'; texto: string; link?: string } | null;

// Quanto tempo o botão fica travado depois de um envio concluído (sucesso ou
// pop-up bloqueado) antes de se liberar sozinho para um reenvio — ex.: o
// usuário fechou a aba do WhatsApp sem querer e precisa mandar de novo.
// Curto o suficiente para não prender o usuário, longo o suficiente para
// blindar contra um segundo clique/toque do mesmo gesto de duplo clique.
const TEMPO_LIBERACAO_MS = 1500;

export function ContactForm() {
  const nomeId = useId();
  const mensagemId = useId();
  const nomeErroId = useId();
  const mensagemErroId = useId();

  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const nomeRef = useRef<HTMLInputElement>(null);
  const mensagemRef = useRef<HTMLTextAreaElement>(null);

  // Guarda de duplo envio via `ref`, não via o estado `enviando` — um
  // segundo clique rapidíssimo pode disparar um `handleSubmit` que ainda
  // fechou sobre o valor antigo do estado (closure não atualizada a tempo de
  // um novo render). `ref.current` é a mesma caixa mutável em qualquer
  // closure, então a mutação feita no primeiro envio é vista de verdade
  // pelo segundo, sem depender de re-render nenhum.
  const enviandoRef = useRef(false);
  // Guarda o timeout que devolve o formulário sozinho depois de
  // TEMPO_LIBERACAO_MS — sem isso, o botão ficava travado para sempre
  // depois de qualquer envio (regressão do fix round 1, achada na
  // re-revisão).
  const liberacaoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (liberacaoRef.current) clearTimeout(liberacaoRef.current);
    };
  }, []);

  // Libera o reenvio na hora quando o usuário edita um campo — mais rápido
  // do que esperar TEMPO_LIBERACAO_MS, e útil se ele perceber um erro de
  // digitação e quiser corrigir e reenviar imediatamente. Não é redundante
  // com o timeout automático: um cobre "o usuário não fez mais nada", o
  // outro cobre "o usuário já está de volta ao formulário".
  function liberarReenvio() {
    if (!enviandoRef.current) return;
    enviandoRef.current = false;
    setEnviando(false);
    if (liberacaoRef.current) {
      clearTimeout(liberacaoRef.current);
      liberacaoRef.current = null;
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (enviandoRef.current) return;

    const nomeValido = nome.trim().length > 0;
    const mensagemValida = mensagem.trim().length > 0;

    const novosErros: Erros = {};
    if (!nomeValido) novosErros.nome = 'Diga seu nome para a gente saber com quem está falando.';
    if (!mensagemValida) novosErros.mensagem = 'Escreva uma mensagem, mesmo curta, antes de enviar.';

    setErros(novosErros);
    setStatus(null);

    if (!nomeValido) {
      nomeRef.current?.focus();
      return;
    }
    if (!mensagemValida) {
      mensagemRef.current?.focus();
      return;
    }

    // Trava o formulário por TEMPO_LIBERACAO_MS — o suficiente para impedir
    // um segundo clique de abrir uma segunda aba, sem prender o usuário para
    // sempre.
    if (liberacaoRef.current) clearTimeout(liberacaoRef.current);
    enviandoRef.current = true;
    setEnviando(true);

    // window.open precisa ser chamado de forma síncrona, dentro do mesmo
    // gesto do usuário (clique/submit) — nenhum `await` antes dele. Um
    // `await` aqui tiraria a chamada do gesto do usuário e faria o WebKit
    // (Safari e todo navegador no iOS) bloquear o pop-up sempre, tornando o
    // caminho de "falha" o normal em vez da exceção.
    const texto = `Olá, meu nome é ${nome}. ${mensagem}`;
    const link = whatsappLink(texto);
    const janela = window.open(link, '_blank');

    if (janela) {
      setStatus({ tipo: 'sucesso', texto: 'Abrimos o WhatsApp numa nova aba…' });
    } else {
      setStatus({
        tipo: 'falha',
        texto:
          'Não conseguimos abrir o WhatsApp automaticamente — o navegador deve ter bloqueado o pop-up.',
        link,
      });
    }

    liberacaoRef.current = setTimeout(() => {
      enviandoRef.current = false;
      setEnviando(false);
      liberacaoRef.current = null;
    }, TEMPO_LIBERACAO_MS);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor={nomeId} className="block text-sm font-medium text-charcoal">
          Nome
        </label>
        <input
          id={nomeId}
          ref={nomeRef}
          value={nome}
          onChange={(event) => {
            setNome(event.target.value);
            if (erros.nome) setErros((atual) => ({ ...atual, nome: undefined }));
            liberarReenvio();
          }}
          aria-invalid={erros.nome ? 'true' : undefined}
          aria-describedby={erros.nome ? nomeErroId : undefined}
          className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2"
        />
        {erros.nome && (
          <p id={nomeErroId} className="mt-1 text-sm text-red-600">
            {erros.nome}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={mensagemId} className="block text-sm font-medium text-charcoal">
          Mensagem
        </label>
        <textarea
          id={mensagemId}
          ref={mensagemRef}
          rows={4}
          value={mensagem}
          onChange={(event) => {
            setMensagem(event.target.value);
            if (erros.mensagem) setErros((atual) => ({ ...atual, mensagem: undefined }));
            liberarReenvio();
          }}
          aria-invalid={erros.mensagem ? 'true' : undefined}
          aria-describedby={erros.mensagem ? mensagemErroId : undefined}
          className="mt-1 block w-full rounded-lg border border-charcoal/20 px-4 py-2"
        />
        {erros.mensagem && (
          <p id={mensagemErroId} className="mt-1 text-sm text-red-600">
            {erros.mensagem}
          </p>
        )}
      </div>

      <Button type="submit" disabled={enviando} aria-busy={enviando}>
        {enviando ? 'Enviando…' : 'Enviar pelo WhatsApp'}
      </Button>

      <div role="status" aria-live="polite">
        {status && (
          <p
            className={`text-sm ${status.tipo === 'sucesso' ? 'text-charcoal/70' : 'text-red-600'}`}
          >
            {status.texto}
            {status.tipo === 'falha' && status.link && (
              <>
                {' '}
                <a href={status.link} className="underline">
                  Abrir o WhatsApp manualmente
                </a>
              </>
            )}
          </p>
        )}
      </div>
    </form>
  );
}
