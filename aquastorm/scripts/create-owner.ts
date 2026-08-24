import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

async function main() {
  console.log('--- AquaStorm Owner Bootstrap ---');
  
  const { data: existingOwners } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'owner')
    .limit(1);

  if (existingOwners && existingOwners.length > 0) {
    console.log('⚠️ Owner already exists. Exiting.');
    rl.close();
    return;
  }

  rl.question('Enter Owner Email: ', async (email) => {
    rl.question('Enter Owner Password (min 6 chars): ', async (password) => {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { role: 'owner' }
      });

      if (error) {
        console.error('❌ Error creating owner:', error.message);
      } else {
        console.log('✅ Owner account created successfully!');
        console.log('You can now log in at /login.');
      }
      rl.close();
    });
  });
}

main();
