// const axios = require('axios');
// require('dotenv').config();

// const PAYMONGO_API_URL = process.env.PAYMONGO_API_URL;
// const SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

// // Create GCash Payment
// async function createGCashPayment(amount, description) {
//     try {
//         const response = await axios.post(
//             `${PAYMONGO_API_URL}/sources`,
//             {
//                 data: {
//                     attributes: {
//                         amount: amount * 100, // PayMongo uses cents
//                         currency: "PHP",
//                         type: "gcash",
//                         redirect: {
//                             success: "http://localhost:3000/success",
//                             failed: "http://localhost:3000/failed"
//                         },
//                         statement_descriptor: description
//                     }
//                 }
//             },
//             {
//                 headers: {
//                     Authorization: `Basic ${Buffer.from(SECRET_KEY + ":").toString('base64')}`,
//                     "Content-Type": "application/json"
//                 }
//             }
//         );

//         return response.data.data; // Payment source object
//     } catch (err) {
//         console.error("PayMongo Error:", err.response?.data || err.message);
//         throw err;
//     }
// }

// module.exports = { createGCashPayment };
