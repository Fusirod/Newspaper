// Fallback news fetcher sử dụng RSS feeds khi NewsAPI bị chặn
const https = require('https');
const fs = require('fs');
const xml2js = require('xml2js');

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync('data')) {
    fs.mkdirSync('data', { recursive: true });
}

// RSS feeds nguồn tin công nghệ
const RSS_FEEDS = [
    { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch', category: 'ai-news' },
    { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', source: 'The Verge', category: 'ai-news' },
    { url: 'https://www.technologyreview.com/feed/', source: 'MIT Tech Review', category: 'ai-news' },
    { url: 'https://venturebeat.com/feed/', source: 'VentureBeat', category: 'startups' },
    { url: 'https://arstechnica.com/feed/', source: 'Ars Technica', category: 'ai-news' }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function fetchRSS(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function parseRSS(xml) {
    const parser = new xml2js.Parser({ explicitArray: false });
    return new Promise((resolve, reject) => {
        parser.parseString(xml, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

function extractTags(text) {
    const keywords = ['AI', 'OpenAI', 'Google', 'Microsoft', 'Meta', 'NVIDIA', 'ChatGPT', 
                     'GPT', 'LLM', 'Machine Learning', 'Neural', 'Deep Learning',
                     'Chatbot', 'Automation', 'Robot', 'Vision', 'NLP', 'Startup', 'Funding'];
    return keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase())).slice(0, 4);
}

async function main() {
    console.log('Fetching news from RSS feeds...');
    
    const allArticles = [];
    
    for (let i = 0; i < RSS_FEEDS.length; i++) {
        const feed = RSS_FEEDS[i];
        try {
            if (i > 0) await delay(1000);
            
            console.log(`Fetching from ${feed.source}...`);
            const xml = await fetchRSS(feed.url);
            const parsed = await parseRSS(xml);
            
            if (!parsed.rss || !parsed.rss.channel || !parsed.rss.channel.item) {
                console.log(`No items found in ${feed.source}`);
                continue;
            }
            
            const items = Array.isArray(parsed.rss.channel.item) 
                ? parsed.rss.channel.item 
                : [parsed.rss.channel.item];
            
            console.log(`Got ${items.length} items from ${feed.source}`);
            
            items.slice(0, 5).forEach((item, index) => {
                allArticles.push({
                    id: `rss_${feed.source}_${Date.now()}_${index}`,
                    title: item.title || 'No title',
                    category: feed.category,
                    source: feed.source,
                    description: item.description ? item.description.replace(/<[^>]*>/g, '').substring(0, 300) : 'No description',
                    link: item.link,
                    tags: extractTags(item.title + ' ' + item.description),
                    date: item.pubDate || new Date().toISOString(),
                    trending: Math.random() > 0.7
                });
            });
        } catch (err) {
            console.error(`Error fetching ${feed.source}:`, err.message);
        }
    }
    
    // Sort by date
    const sortedArticles = allArticles
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20);
    
    fs.writeFileSync('data/news.json', JSON.stringify(sortedArticles, null, 2));
    console.log(`Saved ${sortedArticles.length} news from RSS to data/news.json`);
}

main().catch(console.error);
