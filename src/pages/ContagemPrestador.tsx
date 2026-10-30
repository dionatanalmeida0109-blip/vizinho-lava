import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Apoio, Botao, BotaoExterno, BotaoLink, Campo, Cartao, LinhaValor, Marcar, Nota, Pagina, Quantidade, Titulo } from '../components/ui'
import { ITENS_CONTAGEM } from '../lib/catalogo'
import {
  fechar, opcoesPreco, precoUnitario, salvarContagem,
  type ContagemSalva, type PrecosEscolhidos, type Quantidades,
} from '../lib/contagem'
import { linkWhatsApp } from '../lib/linkPrestador'
import { formatPhone, normalizePhone } from '../lib/phone'
import { LISTA_PRODUTOS, PRODUTOS, reais, type Produto } from '../lib/precos'
import { PROMOCAO } from '../lib/promocao'
import { ROTAS } from '../lib/rotas'

/**
 * Tela do PRESTADOR depois da lavagem: marca as peças lavadas e o app soma
 * pela tabela fixa → valor final. (A foto do cliente gera só o orçamento estimado.)
 */
export default function ContagemPrestador() {
  const session = useAuth()
  const [qtd, setQtd] = useState<Quantidades>({})
  const [precos, setPrecos] = useState<PrecosEscolhidos>({})
  const [usados, setUsados] = useState<Record<Produto, boolean>>({ esponja: false, detergente: false })
  const [pedido, setPedido] = useState('')
  const [cliente, setCliente] = useState('')
  const [salvo, setSalvo] = useState<ContagemSalva | null>(null)

  if (!session) return <Navigate to={ROTAS.loginPrestador} replace />
  if (session.role !== 'prestador') return <Navigate to={ROTAS.orcamento} replace />

  const f = fechar(qtd, precos, usados)
  const total = f.promo.final
  const whatsCliente = normalizePhone(cliente)

  function ajustar(id: string, delta: number) {
    setSalvo(null)
    setQtd((q) => ({ ...q, [id]: Math.max(0, Math.min(999, (q[id] ?? 0) + delta)) }))
  }
  function definir(id: string, v: string) {
    setSalvo(null)
    setQtd((q) => ({ ...q, [id]: Math.max(0, Math.min(999, Math.floor(Number(v) || 0))) }))
  }

  function texto() {
    const l = [`VizinhoLava: valor final da lavagem${pedido.trim() ? ` (pedido ${pedido.trim().toUpperCase()})` : ''}.`, `Lavador: ${session!.name}`, '']
    f.linhas.forEach((x) => l.push(`${x.qtd}× ${x.nome} (${reais(x.unitario)}): ${reais(x.subtotal)}`))
    f.produtos.forEach((p) => l.push(`${p.nome}: ${reais(p.centavos)}`))
    l.push('')
    if (f.promo.ativa) l.push(`Total pela tabela: ${reais(f.promo.original)} · ${PROMOCAO.nome} −${PROMOCAO.percentual}%`)
    l.push(`Valor final: ${reais(total)} (${f.pecas} peças lavadas, contadas no local)`)
    return l.join('\n')
  }

  function fecharValor() {
    setSalvo(salvarContagem({ pedido: pedido.trim().toUpperCase() || undefined, cliente: whatsCliente ?? undefined, total, texto: texto() }))
  }

  function limpar() {
    setQtd({})
    setPrecos({})
    setUsados({ esponja: false, detergente: false })
    setPedido('')
    setCliente('')
    setSalvo(null)
  }

  return (
    <Pagina largura="larga" tag="Prestador" direita={<BotaoLink variante="topo" to={ROTAS.areaPrestador}>← Minha área</BotaoLink>}>
      <Titulo sub={<>
        O orçamento pela foto é só estimado. Agora que você lavou, marque quantas peças de cada item
        foram lavadas: o app soma pela tabela e fecha o valor final.
      </>}>Contagem pós-lavagem</Titulo>

      <Cartao titulo="Pedido (opcional)">
        <Campo rotulo="Código do pedido" value={pedido} onChange={(e) => setPedido(e.target.value)} placeholder="Ex.: K3F9QZ" maxLength={12} />
        <Campo rotulo="WhatsApp do cliente (para enviar o valor final)" type="tel" inputMode="tel" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="(11) 91234-5678" />
      </Cartao>

      {ITENS_CONTAGEM.map((g) => (
        <Cartao key={g.id} titulo={g.titulo}>
          <table className="tabela" data-testid={`contagem-${g.id}`}>
            <thead><tr><th>Item</th><th>Preço</th><th>Lavados</th><th>Subtotal</th></tr></thead>
            <tbody>
              {g.itens.map((i) => {
                const unit = precoUnitario(i, precos)
                const ops = opcoesPreco(i)
                return (
                  <tr key={i.id}>
                    <td>{i.nome}{i.porque && <small className="nota-item">{i.ate ? 'Com gordura: escolha o preço' : 'Exceção: preço próprio'}</small>}</td>
                    <td>
                      {ops.length > 1 ? (
                        <select
                          aria-label={`Preço de ${i.nome}`}
                          value={unit}
                          onChange={(e) => { setSalvo(null); setPrecos((p) => ({ ...p, [i.id]: Number(e.target.value) })) }}
                        >
                          {ops.map((c) => <option key={c} value={c}>{reais(c)}</option>)}
                        </select>
                      ) : reais(unit)}
                    </td>
                    <td>
                      <Quantidade nome={i.nome} rotulo={i.nome} valor={qtd[i.id] ?? 0}
                        onMenos={() => ajustar(i.id, -1)} onMais={() => ajustar(i.id, 1)} onDigitar={(v) => definir(i.id, v)} />
                    </td>
                    <td>{reais((qtd[i.id] ?? 0) * unit)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Cartao>
      ))}

      <Cartao titulo="Produtos de limpeza que você levou">
        <ul className="taxas">
          {LISTA_PRODUTOS.map((p) => (
            <li key={p}>
              <Marcar checked={usados[p]} onChange={(v) => { setSalvo(null); setUsados((s) => ({ ...s, [p]: v })) }}>{PRODUTOS[p].nome}</Marcar>
              <span>{reais(PRODUTOS[p].centavos)}</span>
            </li>
          ))}
        </ul>
        <Apoio>Só marque se o cliente não tinha os produtos e você usou os seus.</Apoio>
      </Cartao>

      <Cartao titulo="Valor final" destaque="resumo" aria-live="polite" data-testid="valor-final">
        <LinhaValor rotulo="Peças lavadas">{f.pecas}</LinhaValor>
        {f.promo.ativa ? (
          <>
            <LinhaValor rotulo="Total pela tabela" testId="final-original">{reais(f.promo.original)}</LinhaValor>
            <LinhaValor rotulo={`${PROMOCAO.nome} (−${PROMOCAO.percentual}%)`}>− {reais(f.promo.desconto)}</LinhaValor>
          </>
        ) : null}
        <LinhaValor rotulo="Valor final" total testId="final">{reais(total)}</LinhaValor>
        <Nota>Soma das peças contadas × preço da tabela. Este é o valor a cobrar (Pix, fora do app).</Nota>
        {!salvo ? (
          <Botao className="solicitar" onClick={fecharValor} disabled={f.pecas === 0} data-testid="fechar-valor">
            Fechar valor final
          </Botao>
        ) : (
          <div className="pedido-ok" role="status" data-testid="contagem-ok">
            <strong>Contagem {salvo.id} fechada: {reais(salvo.total)}</strong>
            <span>Guardada neste aparelho.{whatsCliente ? ` Envie o valor para ${formatPhone(whatsCliente)}.` : ''}</span>
            {whatsCliente && (
              <BotaoExterno href={linkWhatsApp(whatsCliente, salvo.texto)} target="_blank" rel="noreferrer">
                Enviar valor final no WhatsApp do cliente
              </BotaoExterno>
            )}
            <Botao variante="texto" onClick={limpar}>Nova contagem</Botao>
          </div>
        )}
        {f.pecas === 0 && <Nota>Marque pelo menos uma peça lavada.</Nota>}
      </Cartao>
    </Pagina>
  )
}
