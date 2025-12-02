export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Use '*' for testing; restrict to your domain (e.g., 'http://localhost:8080') in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};