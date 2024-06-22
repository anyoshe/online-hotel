// const bcrypt = require('bcrypt');

// // Plain text password
// const plainPassword = 'password123';

// // Hash the password
// bcrypt.hash(plainPassword, 10, (err, hash) => {
//     if (err) {
//         console.error('Hashing error:', err);
//         return;
//     }
//     console.log('Hashed password:', hash);

//     // Compare the plain text password with the hash
//     bcrypt.compare(plainPassword, hash, (err, isMatch) => {
//         if (err) {
//             console.error('Comparison error:', err);
//             return;
//         }
//         console.log('Password match result:', isMatch);
//     });
// });

// const bcrypt = require('bcrypt');

// // Function to hash a password
// async function hashPassword(plainPassword) {
//     const saltRounds = 10;
//     try {
//         const hash = await bcrypt.hash(plainPassword, saltRounds);
//         console.log('Generated Hash:', hash);
//         return hash;
//     } catch (error) {
//         console.error('Hashing Error:', error);
//     }
// }

// // Function to compare a plain password with a hash
// async function comparePassword(plainPassword, hash) {
//     try {
//         const isMatch = await bcrypt.compare(plainPassword, hash);
//         console.log('Password Match Result:', isMatch);
//     } catch (error) {
//         console.error('Comparison Error:', error);
//     }
// }

// // Test the functions
// async function testBcrypt() {
//     const plainPassword = 'edith123';
//     const generatedHash = await hashPassword(plainPassword);

//     // Compare with the same password
//     await comparePassword(plainPassword, generatedHash);

//     // Compare with the hash from the database
//     const storedHash = '$2a$10$Ge.I.JeBRpZ2uF8CjZJAGOx/cHGJNPVqlYDvIs5S48Z7CMAnyJSou';
//     await comparePassword(plainPassword, storedHash);
// }

// testBcrypt();

// const bcrypt = require('bcrypt');

// // Define the stored hash from MongoDB
// const storedHash = '$2a$10$Ge.I.JeBRpZ2uF8CjZJAGOx/cHGJNPVqlYDvIs5S48Z7CMAnyJSou';

// // Define the plain password for comparison
// const plainPassword = 'edith123';

// // Compare the plain password with the stored hash
// bcrypt.compare(plainPassword, storedHash, (err, isMatch) => {
//     if (err) {
//         console.error('Comparison error:', err);
//         return;
//     }
//     console.log('Password Match Result:', isMatch); // Should be true if correct
// });

const bcrypt = require('bcrypt');

// Define the stored hash from MongoDB
const storedHash = '$2a$10$Ge.I.JeBRpZ2uF8CjZJAGOx/cHGJNPVqlYDvIs5S48Z7CMAnyJSou';

// Define the plain password for comparison
const plainPassword = 'edith123';

console.log('Stored Hash:', storedHash);
console.log('Plain Password:', plainPassword);

// Compare the plain password with the stored hash
bcrypt.compare(plainPassword, storedHash, (err, isMatch) => {
    if (err) {
        console.error('Comparison error:', err);
        return;
    }
    console.log('Password Match Result:', isMatch); // Should be true if correct
});


