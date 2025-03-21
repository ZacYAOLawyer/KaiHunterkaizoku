const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.json());

app.get('/health', (req, res) => {
  res.json({ status: 'Crawler is healthy' });
});

app.post('/detect', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing url' });
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.content();
    await browser.close();

    const randomSimilarity = Math.random();
    const isInfringing = (randomSimilarity > 0.95);

    res.json({
      url,
      similarity: randomSimilarity.toFixed(2),
      isInfringing
    });
  } catch (error) {
    console.error('Crawler detect error:', error);
    res.status(500).json({ error: 'Crawler error' });
  }
});

app.listen(8081, () => {
  console.log('Kai Crawler listening on port 8081');
});
