// supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://esslddxlhdwfbgxhzpso.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzc2xkZHhsaGR3ZmJneGh6cHNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjY1OTUwMiwiZXhwIjoyMDYyMjM1NTAyfQ.YrCA04mtrqPD3cddifY1BZMO1pTUJeqsODasJmaZHPU"; // substitua pela sua chave pública

export const supabase = createClient(supabaseUrl, supabaseKey);
