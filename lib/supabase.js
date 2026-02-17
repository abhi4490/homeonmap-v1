import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://djxkfbavvjmoowqspwbg.supabase.co";
const supabaseAnonKey = "sb_publishable_LFmwBftiebc29NwBHh6FNA_f22ddp5h";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
