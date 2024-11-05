const bcrypt = require('bcryptjs');
const argon2 = require('argon2');
async function testPassword() {
    const passwordToHash = '1234';
const hashedPassword = await argon2.hash(passwordToHash);
console.log('Hashed Password:', hashedPassword);

}

testPassword().catch(console.error);
