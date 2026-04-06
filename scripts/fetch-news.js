// Script để fetch news từ NewsAPI (chạy trong Node.js)
const https = require('https');
const fs = require('fs');

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync('data')) {
    fs.mkdirSync('data', { recursive: true });
}

const API_KEY = process.env.NEWS_API_KEY || 'ed05773d6bcd4487ab22e864ede21dc3';

const queries = [
    'artificial intelligence',
    'machine learning'
];

function fetchFromNewsAPI(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
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

async function main() {
    console.log('Fetching news from NewsAPI...');
    
    const allArticles = [];
    
    for (const query of queries) {
        try {
            const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=15&apiKey=${API_KEY}`;
            console.log(`Fetching query: ${query}...`);
            
            const data = await fetchFromNewsAPI(url);
            
            if (data.status === 'ok' && data.articles) {
                console.log(`Got ${data.articles.length} articles for ${query}`);
                allArticles.push(...data.articles);
            } else {
                console.error('NewsAPI error:', data.message || 'Unknown error');
            }
        } catch (err) {
            console.error(`Error fetching ${query}:`, err.message);
        }
    }
    
    // Remove duplicates
    const seen = new Set();
    const uniqueArticles = allArticles.filter(article => {
        const key = article.url || article.title;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    
    // Sort and convert format
    const sortedArticles = uniqueArticles
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
    
    // Save to file
    fs.writeFileSync('data/news.json', JSON.stringify(sortedArticles, null, 2));
    console.log(`Saved ${sortedArticles.length} news to data/news.json`);
}

main().catch(console.error);
