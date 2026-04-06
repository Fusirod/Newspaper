// Script để fetch news từ NewsAPI (chạy trong Node.js)
const https = require('https');
const fs = require('fs');
const http = require('http');

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync('data')) {
    fs.mkdirSync('data', { recursive: true });
}

const API_KEY = process.env.NEWS_API_KEY || 'ed05773d6bcd4487ab22e864ede21dc3';

const queries = [
    'artificial intelligence',
    'machine learning'
];

// Delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function fetchFromNewsAPI(url) {
    return new Promise((resolve, reject) => {
        const options = new URL(url);
        const client = options.protocol === 'https:' ? https : http;
        
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });
        
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function main() {
    console.log('Fetching news from NewsAPI...');
    console.log('API Key:', API_KEY.substring(0, 10) + '...');
    
    const allArticles = [];
    
    for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        try {
            // Wait 2 seconds between requests to avoid rate limit
            if (i > 0) {
                console.log('Waiting 2s before next request...');
                await delay(2000);
            }
            
            const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=15&apiKey=${API_KEY}`;
            console.log(`Fetching query: ${query}...`);
            
            const data = await fetchFromNewsAPI(url);
            console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500));
            
            if (data.status === 'ok' && data.articles && data.articles.length > 0) {
                console.log(`Got ${data.articles.length} articles for ${query}`);
                allArticles.push(...data.articles);
            } else if (data.status === 'error') {
                console.error('NewsAPI Error:', data.code, data.message);
            } else {
                console.log('No articles found for', query);
            }
        } catch (err) {
            console.error(`Error fetching ${query}:`, err.message);
        }
    }
    
    // Save even if empty (will use fallback in app)
    const newsData = allArticles.length > 0 ? processArticles(allArticles) : [];
    
    fs.writeFileSync('data/news.json', JSON.stringify(newsData, null, 2));
    console.log(`Saved ${newsData.length} news to data/news.json`);
}

function processArticles(articles) {
    // Remove duplicates
    const seen = new Set();
    const uniqueArticles = articles.filter(article => {
        const key = article.url || article.title;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    
    // Sort and convert format
    return uniqueArticles
        .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
        .slice(0, 20)
        .map((article, index) => ({
            id: `api_${Date.now()}_${index}`,
            title: article.title || 'No title',
            category: determineCategory(article.title, article.description),
            source: article.source?.name || 'Unknown',
            description: article.description || article.content || 'No description available',
            link: article.url,
            tags: extractTags(article.title + ' ' + article.description),
            date: article.publishedAt || new Date().toISOString(),
            trending: Math.random() > 0.7,
            imageUrl: article.urlToImage
        }));
}

function extractTags(text) {
    const keywords = ['AI', 'OpenAI', 'Google', 'Microsoft', 'Meta', 'NVIDIA', 'ChatGPT', 
                     'GPT', 'LLM', 'Machine Learning', 'Neural', 'Deep Learning',
                     'Chatbot', 'Automation', 'Robot', 'Vision', 'NLP'];
    return keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase())).slice(0, 4);
}

function determineCategory(title, description) {
    const t = (title || '').toLowerCase();
    const d = (description || '').toLowerCase();
    
    if (t.includes('google') || t.includes('microsoft') || t.includes('nvidia') || 
        t.includes('amazon') || t.includes('meta') || t.includes('apple')) {
        return 'tech-giants';
    } else if (t.includes('research') || t.includes('study') || t.includes('paper') ||
               d.includes('research') || d.includes('arxiv')) {
        return 'research';
    } else if (t.includes('startup') || t.includes('funding') || t.includes('million') ||
               t.includes('billion') || t.includes('invest')) {
        return 'startups';
    }
    return 'ai-news';
}

main().catch(console.error);
