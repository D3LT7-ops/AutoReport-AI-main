function requireEnv(name) {
  const val = process.env[name]
  if (!val) throw new Error(`❌ Variável de ambiente obrigatória não configurada: "${name}"`)
  return val
}

function optionalEnv(name, fallback = '') { return process.env[name] || fallback }

export const env = {
  supabaseUrl:     requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  appUrl:          optionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  get supabaseServiceKey() { return optionalEnv('SUPABASE_SERVICE_ROLE_KEY') },
  get mpToken()            { return optionalEnv('MP_ACCESS_TOKEN') },
  get adminSecretKey()     { return optionalEnv('ADMIN_SECRET_KEY') },
  get mpWebhookSecret()    { return optionalEnv('MP_WEBHOOK_SECRET') },
}
