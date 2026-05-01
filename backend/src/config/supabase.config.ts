import { registerAs } from '@nestjs/config';

export default registerAs('supabase', () => ({
  url: process.env.SUPABASE_URL,
  anon: process.env.SUPABASE_ANON_PUBLIC,
  serviceRole: process.env.SUPABASE_SERVICE_ROLE,
}));
