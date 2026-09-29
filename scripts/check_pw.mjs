import bcrypt from 'bcryptjs';

const hash = '$2a$10$me3kJm2EJebl9lHzSC1YCOBoJPdakqf63T716lYjFEWtyfaHCLMXq';

async function test() {
  console.log('Talent5Admin2026!:', await bcrypt.compare('Talent5Admin2026!', hash));
  console.log('Admin@123:', await bcrypt.compare('Admin@123', hash));
  console.log('Admin2026!:', await bcrypt.compare('Admin2026!', hash));
  console.log('talent5:', await bcrypt.compare('talent5', hash));
  console.log('admin:', await bcrypt.compare('admin', hash));
}

test();
