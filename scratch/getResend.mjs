import { Resend } from 'resend';
import fs from 'fs';

let env = '';
try {
  env = fs.readFileSync('.env.local', 'utf-8');
} catch {
  env = fs.readFileSync('.env', 'utf-8');
}

const keyMatch = env.match(/RESEND_API_KEY=([^\n]+)/);
const key = keyMatch[1].trim();

const resend = new Resend(key);

async function run() {
    const { data, error } = await resend.emails.list({ limit: 1 });
    if(error){
     console.error(error); return;
    }
    console.log(JSON.stringify(data, null, 2));
}

run();
