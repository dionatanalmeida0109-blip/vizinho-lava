import type { HTMLAttributes, ReactNode } from 'react'

/** Bloco branco arredondado que agrupa uma seção da tela. destaque="resumo" | "churrasco". */
export function Cartao({ titulo, destaque, className, children, ...props }: HTMLAttributes<HTMLElement> & { titulo?: ReactNode; destaque?: 'resumo' | 'churrasco' }) {
  const cls = ['cartao', destaque, className].filter(Boolean).join(' ')
  return (
    <section className={cls} {...props}>
      {titulo && <h2>{titulo}</h2>}
      {children}
    </section>
  )
}

/** Linha "rótulo ............ valor" (resumo do orçamento). */
export function LinhaValor({ rotulo, children, total, testId }: { rotulo: ReactNode; children: ReactNode; total?: boolean; testId?: string }) {
  return (
    <div className={total ? 'linha total' : 'linha'}>
      <span>{rotulo}</span>
      <span data-testid={testId}>{children}</span>
    </div>
  )
}
