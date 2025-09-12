# AI Features Setup Guide

## Quick Setup

1. **Copy the environment file:**

   ```bash
   cp .env.example .env
   ```

2. **Add your OpenAI API key to `.env`:**

   ```
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```

   Replace `your_openai_api_key_here` with your actual OpenAI API key from https://platform.openai.com/api-keys

3. **Restart the app:**
   ```bash
   npm start
   ```

## AI Features Enabled

With the API key configured, the following features will work:

- **🤖 Gardener AI Chat**: Personalized dating advice using GPT-4
- **❓ Daily Quiz Generation**: AI-generated questions about dating preferences
- **🛡️ Safety Analysis**: Message screening for red flags
- **💬 Smart Conversation Starters**: AI-suggested icebreakers

## Important Notes

- The `.env` file is gitignored and will never be committed
- The API key is required for AI features to work
- Without the API key, the app will use fallback responses
- Keep your API key secure and never share it publicly

## Troubleshooting

If AI features aren't working:

1. Verify `.env` file exists in the project root
2. Check that the API key is correctly formatted
3. Restart the development server after adding the key
4. Clear the app cache if needed: `npx expo start --clear`

## Security

- Never commit `.env` files with real API keys
- Use environment-specific keys for production
- Rotate keys regularly for security
- Monitor API usage in OpenAI dashboard
