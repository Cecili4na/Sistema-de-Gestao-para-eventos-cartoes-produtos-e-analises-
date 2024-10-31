import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zbmdzdubztyxtnsxxbli.supabase.co'; // Adicione aspas ao redor da URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpibWR6ZHVienR5eHRuc3h4YmxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk3MTE4NjMsImV4cCI6MjA0NTI4Nzg2M30.rPE0vHybGXwGTWWqAgPClyxCIYyY3u2hViOQtGfIrP4'; // Adicione aspas ao redor da chave

export const supabase = createClient(supabaseUrl, supabaseKey);
