import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

// Parse apps/web/.env.local manually without external dependencies
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

async function runSmtpTest() {
  console.log('======================================================');
  console.log('🧪 TALENT5 GMAIL SMTP CONNECTION & DELIVERY TEST');
  console.log('======================================================\n');

  const env = loadEnv();
  const user = env.EMAIL_USER;
  const pass = env.EMAIL_APP_PASSWORD?.replace(/\s+/g, '');
  const from = env.EMAIL_FROM || `"Talent5 Support" <${user}>`;

  console.log(`Checking configured variables:`);
  console.log(`• EMAIL_USER:         ${user || 'NOT CONFIGURED ❌'}`);
  console.log(`• EMAIL_APP_PASSWORD: ${pass ? 'CONFIGURED (16-char secret loaded) ✅' : 'NOT CONFIGURED ❌'}`);
  console.log(`• EMAIL_FROM:         ${from}\n`);

  if (!user || !pass || user === 'yourwebsite@gmail.com' || pass.includes('xxxx')) {
    console.log('⚠️ Gmail SMTP is not yet configured in apps/web/.env.local.');
    console.log('To configure:');
    console.log('  1. Generate a 16-character Google App Password at: https://myaccount.google.com/apppasswords');
    console.log('  2. In apps/web/.env.local, set:');
    console.log('     EMAIL_USER=your_email@gmail.com');
    console.log('     EMAIL_APP_PASSWORD=your_16_char_app_password');
    console.log('     EMAIL_FROM="Talent5 Support <your_email@gmail.com>"');
    console.log('\n======================================================');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });

  // 1. Test SMTP Server Connection & Handshake
  console.log('1. Connecting to smtp.gmail.com (verifying credentials)...');
  try {
    await transporter.verify();
    console.log('✅ Gmail SMTP handshake SUCCESSFUL! Credentials accepted by Google.\n');
  } catch (authErr) {
    console.error('❌ Gmail SMTP authentication FAILED!');
    console.error(`Error Code: ${authErr.code || 'UNKNOWN'}`);
    console.error(`Server Message: ${authErr.message}`);
    console.log('\nTroubleshooting tips:');
    console.log('• Ensure 2-Step Verification is turned ON for your Google Account.');
    console.log('• Ensure you are using a 16-character "App Password", NOT your personal Google password.');
    console.log('• Verify that EMAIL_USER exactly matches the Google account that generated the App Password.');
    console.log('\n======================================================');
    process.exit(1);
  }

  // 2. Dispatch Live Verification Test Email
  console.log(`2. Sending live test email to: ${user}...`);
  try {
    const testTime = new Date().toLocaleString();
    const info = await transporter.sendMail({
      from,
      to: user,
      subject: '✅ Talent5 Gmail SMTP Test: Connection Verified',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #080b11; color: #f3f4f6; padding: 32px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid rgba(245,158,11,0.3);">
          <h2 style="color: #f59e0b; margin-top: 0;">🎵 Talent5 Gmail SMTP Verified!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #d1d5db;">
            This email confirms that your Talent5 backend is successfully connected to <strong>Gmail SMTP</strong> via Nodemailer.
          </p>
          <div style="background: rgba(255,255,255,0.05); padding: 14px; border-radius: 10px; margin: 16px 0; font-size: 13px; font-family: monospace;">
            Timestamp: ${testTime}<br/>
            Sender: ${from}<br/>
            Recipient: ${user}
          </div>
          <p style="font-size: 12px; color: #9ca3af; margin-bottom: 0;">
            Forgot Password verification codes will now be delivered directly to real user inboxes.
          </p>
        </div>
      `,
    });

    console.log(`✅ Test email successfully dispatched to ${user}!`);
    console.log(`• MessageId: ${info.messageId}`);
    console.log(`• Response:  ${info.response}`);
    console.log('\n🎉 GMAIL SMTP IS FULLY OPERATIONAL!');
    console.log('======================================================');
  } catch (sendErr) {
    console.error('❌ Failed to send test email:');
    console.error(sendErr.message);
    process.exit(1);
  }
}

runSmtpTest();
