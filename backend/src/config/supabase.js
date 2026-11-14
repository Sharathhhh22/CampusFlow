import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseAdmin = null;
let supabaseClient = null;

if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
  supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

export { supabaseAdmin, supabaseClient };

