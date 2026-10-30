import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react'

/** Formulário em coluna com espaçamento padrão. */
export function Formulario({ onSubmit, children }: { onSubmit: (e: FormEvent) => void; children: ReactNode }) {
  return <form className="form" onSubmit={onSubmit}>{children}</form>
}

/** Campo de texto com rótulo em cima. Aceita todas as props de <input>. */
export function Campo({ rotulo, ...props }: InputHTMLAttributes<HTMLInputElement> & { rotulo: ReactNode }) {
  return (
    <label>
      {rotulo}
      <input {...props} />
    </label>
  )
}

/** Caixa de seleção com o texto ao lado. */
export function Marcar({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  )
}

/** Mensagem de erro (vermelho, role=alert) ou de sucesso (verde, role=status). */
export function Mensagem({ tipo, children }: { tipo: 'erro' | 'ok'; children: ReactNode }) {
  if (!children) return null
  return tipo === 'erro'
    ? <p className="erro" role="alert">{children}</p>
    : <p className="aviso" role="status">{children}</p>
}

/** Seletor −/+ de quantidade. */
export function Quantidade({ nome, rotulo, valor, onMais, onMenos, onDigitar }: {
  /** Usado em "Menos X" / "Mais X". */
  nome: string
  /** Usado em "Quantidade de X". */
  rotulo: string
  valor: number
  onMais: () => void
  onMenos: () => void
  /** Sem isso, o número é só leitura. */
  onDigitar?: (v: string) => void
}) {
  return (
    <div className="qtd">
      <button type="button" aria-label={`Menos ${nome}`} onClick={onMenos}>−</button>
      <input
        inputMode="numeric"
        aria-label={`Quantidade de ${rotulo}`}
        value={valor}
        readOnly={!onDigitar}
        onChange={onDigitar ? (e) => onDigitar(e.target.value) : undefined}
      />
      <button type="button" aria-label={`Mais ${nome}`} onClick={onMais}>+</button>
    </div>
  )
}
