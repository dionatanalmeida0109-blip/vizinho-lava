import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import {
  Apoio, Botao, BotaoExterno, BotaoLink, Campo, Cartao, LinhaValor, Marcar, Nota, Pagina, Titulo,
} from '../components/ui'
import { fecharBase, salvarContagem, type ContagemSalva } from '../lib/contagem'
import { linkWhatsApp } from '../lib/linkPrestador'
import { formatPhone, normalizePhone } from '../lib/phone'
import {
  LISTA_PRODUTOS, ORCAMENTO, PRODUTOS, limitarBase, reais, type Produto,
} from '../lib/precos'
import { listarPedidos, pedidoPorId } from '../lib/pedidos'
import { ROTAS } from '../lib/rotas'

/**
 * Confirmação do lavador no local: valida/ajusta o valor base (R$ 20–30)
 * e registra produtos que levou. Substitui a contagem peça a peça como preço final.
 */
export default function ContagemPrestador() {
  const session = useAuth()
  const pedidosAbertos = useMemo(() => listarPedidos().filter((p) => p.status === 'solicitado' || p.status === 'confirmado'), [])
  const [codigo, setCodigo] = useState('')
  const [base, setBase] = useState<number>(ORCAMENTO.volumes.media.centavos)
  const [sugerida, setSugerida] = useState<number>(ORCAMENTO.volumes.media.centavos)
  const [usados, setUsados] = useState<Record<Produto, boolean>>({ esponja: false, detergente: false })
  const [cliente, setCliente] = useState('')
  const [notas, setNotas] = useState('')
  const [salvo, setSalvo] = useState<ContagemSalva | null>(null)

  if (!session) return <Navigate to={ROTAS.loginPrestador} replace />
  if (session.role !== 'prestador') return <Navigate to={ROTAS.orcamento} replace />

  const f = fecharBase(base, usados)

  function carregarPedido(id: string) {
    const p = pedidoPorId(id)
    if (!p) return
    setCodigo(p.id)
    setBase(limitarBase(p.baseCentavos))
    setSugerida(limitarBase(p.baseCentavos))
    setCliente(p.telefone ? formatPhone(p.telefone) : '')
    const marcados: Record<Produto, boolean> = { esponja: false, detergente: false }
    for (const prod of p.produtos ?? []) marcados[prod] = true
    setUsados(marcados)
    setSalvo(null)
  }

  function ajustarBase(delta: number) {
    setSalvo(null)
    setBase((b) => limitarBase(b + delta))
  }

  function texto() {
    const whatsCliente = normalizePhone(cliente)
    const l = [
      `VizinhoLava: valor confirmado no local${codigo.trim() ? ` (pedido ${codigo.trim().toUpperCase()})` : ''}.`,
      `Lavador: ${session!.name}`,
      '',
      `Sugestão (foto/IA): ${reais(sugerida)}`,
      `Valor base confirmado: ${reais(f.baseCentavos)}`,
    ]
    f.produtos.forEach((p) => l.push(`${p.nome}: ${reais(p.centavos)}`))
    if (notas.trim()) l.push(`Obs.: ${notas.trim()}`)
    l.push('', `Total a pagar: ${reais(f.total)}`, 'Pix combinado fora do app.')
    if (whatsCliente) l.push(`Cliente: ${formatPhone(whatsCliente)}`)
    return l.join('\n')
  }

  function fecharValor() {
    const whatsCliente = normalizePhone(cliente)
    setSalvo(salvarContagem({
      pedido: codigo.trim().toUpperCase() || undefined,
      cliente: whatsCliente ?? undefined,
      lavadorNome: session!.name,
      baseSugerida: sugerida,
      baseConfirmada: f.baseCentavos,
      produtos: f.produtos.map((p) => p.id),
      total: f.total,
      notas: notas.trim() || undefined,
      texto: texto(),
    }))
  }

  function limpar() {
    setCodigo('')
    setBase(ORCAMENTO.volumes.media.centavos)
    setSugerida(ORCAMENTO.volumes.media.centavos)
    setUsados({ esponja: false, detergente: false })
    setCliente('')
    setNotas('')
    setSalvo(null)
  }

  return (
    <Pagina largura="larga" tag="Prestador" direita={<BotaoLink variante="topo" to={ROTAS.areaPrestador}>← Minha área</BotaoLink>}>
      <Titulo sub={<>
        A foto gerou só uma sugestão. No local, confirme o valor base (faixa {reais(ORCAMENTO.minCentavos)}–{reais(ORCAMENTO.maxCentavos)})
        e marque se usou produtos seus.
      </>}>Confirmar serviço no local</Titulo>

      {pedidosAbertos.length > 0 && (
        <Cartao titulo="Pedidos abertos neste aparelho">
          <ul className="historico">
            {pedidosAbertos.slice(0, 6).map((p) => (
              <li key={p.id}>
                <div>
                  <strong>{p.id}</strong>
                  <small>{p.nomeCliente ?? formatPhone(p.telefone)} · sugerido {reais(p.baseCentavos)}</small>
                </div>
                <Botao variante="secundario" onClick={() => carregarPedido(p.id)}>Usar</Botao>
              </li>
            ))}
          </ul>
        </Cartao>
      )}

      <Cartao titulo="Pedido (opcional)">
        <Campo
          rotulo="Código do pedido"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onBlur={() => { if (codigo.trim()) carregarPedido(codigo) }}
          placeholder="Ex.: K3F9QZ"
          maxLength={12}
        />
        <Campo
          rotulo="WhatsApp do cliente (para enviar o valor final)"
          type="tel"
          inputMode="tel"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          placeholder="(41) 99876-5432"
        />
      </Cartao>

      <Cartao titulo="Valor base confirmado">
        <Apoio>
          Sugestão da foto/IA: <strong>{reais(sugerida)}</strong>. Ajuste se a pia real for mais ou menos trabalho
          (gordura queimada, volume diferente).
        </Apoio>
        <div className="ajuste-base" data-testid="ajuste-base">
          <Botao variante="secundario" onClick={() => ajustarBase(-100)} aria-label="Diminuir R$ 1">− R$ 1</Botao>
          <Botao variante="secundario" onClick={() => ajustarBase(-50)} aria-label="Diminuir R$ 0,50">− R$ 0,50</Botao>
          <strong className="base-valor" data-testid="base-confirmada">{reais(base)}</strong>
          <Botao variante="secundario" onClick={() => ajustarBase(50)} aria-label="Aumentar R$ 0,50">+ R$ 0,50</Botao>
          <Botao variante="secundario" onClick={() => ajustarBase(100)} aria-label="Aumentar R$ 1">+ R$ 1</Botao>
        </div>
        <div className="volumes" role="group" aria-label="Atalhos de volume">
          {(Object.keys(ORCAMENTO.volumes) as Array<keyof typeof ORCAMENTO.volumes>).map((v) => (
            <button
              key={v}
              type="button"
              className={`volume ${base === ORCAMENTO.volumes[v].centavos ? 'ativo' : ''}`}
              onClick={() => { setSalvo(null); setBase(ORCAMENTO.volumes[v].centavos) }}
            >
              <strong>{ORCAMENTO.volumes[v].rotulo}</strong>
              <span>{reais(ORCAMENTO.volumes[v].centavos)}</span>
            </button>
          ))}
        </div>
        <Nota>Limite da faixa natural: {reais(ORCAMENTO.minCentavos)} a {reais(ORCAMENTO.maxCentavos)}.</Nota>
      </Cartao>

      <Cartao titulo="Produtos de limpeza que você levou">
        <ul className="taxas">
          {LISTA_PRODUTOS.map((p) => (
            <li key={p}>
              <Marcar
                checked={usados[p]}
                onChange={(v) => { setSalvo(null); setUsados((s) => ({ ...s, [p]: v })) }}
              >
                {PRODUTOS[p].nome}
              </Marcar>
              <span>{reais(PRODUTOS[p].centavos)}</span>
            </li>
          ))}
        </ul>
        <Apoio>Só marque se o cliente não tinha os produtos e você usou os seus.</Apoio>
      </Cartao>

      <Cartao titulo="Observação (opcional)">
        <Campo
          rotulo="Nota para o cliente"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Ex.: panela com gordura queimada — mantive o valor cheio"
        />
      </Cartao>

      <Cartao titulo="Valor final" destaque="resumo" aria-live="polite" data-testid="valor-final">
        <LinhaValor rotulo="Sugestão (foto)">{reais(sugerida)}</LinhaValor>
        <LinhaValor rotulo="Base confirmada">{reais(f.baseCentavos)}</LinhaValor>
        {f.produtos.map((p) => (
          <LinhaValor key={p.id} rotulo={p.nome}>{reais(p.centavos)}</LinhaValor>
        ))}
        <LinhaValor rotulo="Total a cobrar" total testId="final">{reais(f.total)}</LinhaValor>
        <Nota>Este é o valor a combinar no Pix (fora do app).</Nota>
        {!salvo ? (
          <Botao className="solicitar" onClick={fecharValor} data-testid="fechar-valor">
            Confirmar e fechar valor
          </Botao>
        ) : (
          <div className="pedido-ok" role="status" data-testid="contagem-ok">
            <strong>Serviço {salvo.id} fechado: {reais(salvo.total)}</strong>
            <span>Guardado neste aparelho.</span>
            {normalizePhone(cliente) && (
              <BotaoExterno href={linkWhatsApp(normalizePhone(cliente)!, salvo.texto)} target="_blank" rel="noreferrer">
                Enviar valor final no WhatsApp do cliente
              </BotaoExterno>
            )}
            <Botao variante="texto" onClick={limpar}>Novo serviço</Botao>
          </div>
        )}
      </Cartao>
    </Pagina>
  )
}
