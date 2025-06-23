import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://iozckjvzcctwwxzopfoe.supabase.co";

const supabaseAnonKey =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvemNranZ6Y2N0d3d4em9wZm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNjY5OTgsImV4cCI6MjA2NTc0Mjk5OH0.dpL_A0P8UoLOGxWlts-zo95DwuGkICj_HTID5-rIo5U";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);