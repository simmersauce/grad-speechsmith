
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://zfseoawfbgxedeaqjzds.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpmc2VvYXdmYmd4ZWRlYXFqemRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2OTE5MzMsImV4cCI6MjA1NjI2NzkzM30.qsvP_UIfXgxTbKJSVR-Idz7kXriUNlQ7MXrw_FxaR7Y";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
