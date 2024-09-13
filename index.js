const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Статическая информация о магазине
const storeInfo = {
    name: 'Цветочный Магазин "Gulmarket"',
    address: 'г. Астана, проспект Тауелсиздик, 10',
};

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(bodyParser.json());
app.use(cors());

// Функция для генерации ответа через API OpenAI с добавлением специфики магазина
async function generateResponse(message) {
    try {
        let botMessage;

        // Примеры фраз, которые будут отправлять в WhatsApp
        if (message.toLowerCase().includes('поговорить с человеком') ||
            message.toLowerCase().includes('общение') ||
            message.toLowerCase().includes('написать в whatsapp') ||
            message.toLowerCase().includes('продавец') ||
            message.toLowerCase().includes('продавца') ||
            message.toLowerCase().includes('специалист') ||
            message.toLowerCase().includes('вотсап') ||
            message.toLowerCase().includes('связаться') ||
            message.toLowerCase().includes('директор') ||
            message.toLowerCase().includes('заказ') ||
            message.toLowerCase().includes('купить') ||
            message.toLowerCase().includes('владелец') ||
            message.toLowerCase().includes('дай whatsapp')) {
            
            // Ответ с номером WhatsApp
            botMessage = `Вы можете связаться с нашим специалистом через WhatsApp по кнопке снизу`;
        } else if (message.toLowerCase().includes('адрес') || message.toLowerCase().includes('где')) {
            // Если в сообщении упоминается адрес
            botMessage = `Наш магазин находится по адресу: ${storeInfo.address}. Могу помочь с чем-то еще?`;
        } else if (message.toLowerCase().includes('имя') || message.toLowerCase().includes('название')) {
            // Если в сообщении упоминается имя/название магазина
            botMessage = `Магазин называется "${storeInfo.name}". Чем можем помочь?`;
        } else {
            // Основной запрос к OpenAI API
            const response = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Ты чат-бот цветочного магазина "Gulmarket". Отвечай на вопросы только о цветах, растениях и магазине. Помогай пользователям с вопросами о цветах и растениях. Если вопрос специфичный — скажи Вы можете связаться с нашим специалистом через WhatsApp по кнопке снизу.' },
                    { role: 'user', content: message }
                ],
                max_tokens: 250
            });

            botMessage = response.choices[0]?.message?.content?.trim() || 'Извините, я не могу сейчас ответить на ваш запрос.';
        }

        return botMessage;
    } catch (error) {
        console.error('Error from OpenAI:', error.response ? error.response.data : error.message);
        return 'Извините, я не могу обработать ваш запрос сейчас.';
    }
}


app.post('/chatbot', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const botResponse = await generateResponse(userMessage);
        res.json({ response: botResponse });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

app.listen(PORT, () => {
    console.log(`Chatbot server running at http://localhost:${PORT}`);
});
