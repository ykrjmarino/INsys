require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { default: test } = require("node:test");

const app = express();
const port = 3000;
const apiKey = process.env.OPENAI_API_KEY

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public')); 
app.set('view engine', 'ejs');

//THIS IS FOR OPENAI, EWAN KO BAKIT ANDITO PA RIN TO
// app.post('/evaluate', async (req, res) => {
//   const { name, score, totalItems, weakTopics } = req.body;

//   try {
//     const response = await axios.post(
//       'https://api.openai.com/v1/chat/completions',
//       {
//         model: 'gpt-3.5-turbo',
//         messages: [
//           {
//             role: 'system',
//             content: 'You are an academic evaluator that gives helpful, short feedback.'
//           },
//           {
//             role: 'user',
//             content: `Student ${name} scored ${score}/${totalItems}. Weak topics: ${weakTopics}. Please summarize their performance and give short suggestions.`
//           }
//         ],
//         temperature: 0.7
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     const feedback = response.data.choices[0].message.content;
//     res.json({ feedback });

//   } catch (error) {
//     console.error(error.response?.data || error.message);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// });


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});