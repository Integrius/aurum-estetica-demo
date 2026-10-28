import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="flex min-h-[70svh] items-center py-32">
      <Container size="narrow" className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-terracotta">Erro 404</p>
        <h1 className="mt-5 font-display text-display text-charcoal">Página não encontrada</h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-charcoal/70">
          O endereço que você tentou abrir não existe ou foi movido. Volte para a página inicial
          ou veja os tratamentos disponíveis.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="/">Página inicial</Button>
          <Button href="/servicos" variant="outline">
            Ver tratamentos
          </Button>
        </div>
      </Container>
    </main>
  );
}
