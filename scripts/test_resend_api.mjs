import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';

function loadEnv() {
  const envPath = path.resolve('apps/web/.env.local');
  if (!fs.existsSync(envPath)) {
    console.error(`❌ .env.local not found at: ${envPath}`);
    return {};
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

async function runResendTest() {
  console.log('======================================================');
  console.log('✉️  TALENT5 RESEND API CONNECTION & DELIVERY TEST');
  console.log('======================================================\n');

  const env = loadEnv();
  const apiKey = env.RESEND_API_KEY?.trim();
  const from = env.RESEND_FROM || 'Talent5 Support <onboarding@resend.dev>';
  const to = env.EMAIL_USER || 'kunchalapoojitha3@gmail.com';

  const isConfigured = Boolean(
    apiKey &&
    apiKey.startsWith('re_') &&
    apiKey !== 're_your_resend_api_key_here' &&
    !apiKey.includes('your_resend')
  );

  console.log('Configured Resend Parameters:');
  console.log(`• RESEND_API_KEY: ${isConfigured ? 'CONFIGURED (' + apiKey.substring(0, 8) + '...) ✅' : 'NOT CONFIGURED ❌'}`);
  console.log(`• RESEND_FROM:    ${from}`);
  console.log(`• Recipient (TO): ${to}\n`);

  if (!isConfigured) {
    console.log('⚠️  Resend API key is not yet added in apps/web/.env.local.');
    console.log('\nTo configure:');
    console.log('  1. Sign up / log in at: https://resend.com');
    console.log('  2. Click "API Keys" -> "Create API Key"');
    console.log('  3. In apps/web/.env.local, set:');
    console.log('     RESEND_API_KEY=re_your_actual_key_here');
    console.log('     RESEND_FROM="Talent5 Support <onboarding@resend.dev>"');
    console.log('\n======================================================');
    process.exit(1);
  }

  const resend = new Resend(apiKey);
  console.log('1. Dispatching live email via Resend API (https://api.resend.com/emails)...');

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: '✅ Talent5 Resend API Test: Connection Operational',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #080b11; color: #f3f4f6; padding: 32px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(245,158,11,0.3);">
          <h2 style="color: #f59e0b; margin-top: 0;">🎵 Talent5 Resend API Verified!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #d1d5db;">
            This email confirms that your Talent5 backend is successfully connected to the <strong>Resend API</strong>.
          </p>
          <div style="background: rgba(255,255,255,0.05); padding: 14px; border-radius: 10px; margin: 16px 0; font-size: 13px; font-family: monospace;">
            Sender: ${from}<br/>
            Recipient: ${to}<br/>
            Provider: Resend API
          </div>
          <p style="font-size: 12px; color: #9ca3af; margin-bottom: 0;">
            Forgot Password verification codes and system notifications will be dispatched through Resend.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend API returned an error:');
      console.error(`• Message: ${error.message}`);
      console.error(`• Name:    ${error.name}`);
      console.log('\nNote: On Resend free accounts without a verified custom domain,');
      console.log('emails can only be sent from onboarding@resend.dev to the email registered on your Resend account.');
      console.log('To send to any email, verify your custom domain on Resend.');
      process.exit(1);
    }

    console.log('✅ Email successfully dispatched via Resend API!');
    console.log(`• Resend ID: ${data?.id}`);
    console.log('\n🎉 RESEND API IS FULLY OPERATIONAL!');
    console.log('======================================================');
  } catch (err) {
    console.error('❌ Resend network exception:', err.message);
    process.exit(1);
  }
}

runResendTest();
