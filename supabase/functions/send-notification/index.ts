/**
 * Supabase Edge Function: send-notification
 *
 * Sends push notifications to all registered tokens (or a subset).
 * Invoke manually from the Supabase dashboard or via HTTP for event changes.
 *
 * POST body:
 * {
 *   title: string,
 *   body: string,
 *   data?: Record<string, unknown>
 * }
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('FUNCTION_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { title, body, data } = await req.json() as {
    title: string;
    body: string;
    data?: Record<string, unknown>;
  };

  if (!title || !body) {
    return new Response(JSON.stringify({ error: 'title and body are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch all tokens from DB
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: rows, error } = await supabase.from('push_tokens').select('token');
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const tokens = (rows ?? []).map((r) => r.token);
  if (tokens.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Build messages in chunks of 100 (Expo limit)
  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += 100) {
    chunks.push(tokens.slice(i, i + 100));
  }

  let sent = 0;
  for (const chunk of chunks) {
    const messages = chunk.map((token) => ({ to: token, title, body, data: data ?? {} }));
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });
    if (res.ok) sent += chunk.length;
  }

  return new Response(JSON.stringify({ sent }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
