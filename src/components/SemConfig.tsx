export function SemConfig() {
  return (
    <div className="alerta" role="alert">
      <strong>Login indisponível.</strong> O Supabase não está configurado: defina{' '}
      <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no arquivo{' '}
      <code>.env</code> (veja <code>.env.example</code>) e reinicie o app.
    </div>
  )
}
