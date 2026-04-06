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
    console.log('Current directory:', process.cwd());
    
    // Đảm bảo thư mục data tồn tại
    if (!fs.existsSync('data')) {
        console.log('Creating data directory...');
        fs.mkdirSync('data', { recursive: true });
    }
    
    const allArticles = [];
    let successCount = 0;
    
    for (let i = 0; i < RSS_FEEDS.length; i++) {
        const feed = RSS_FEEDS[i];
        try {
            if (i > 0) await delay(1000);
            
            console.log(`[${i+1}/${RSS_FEEDS.length}] Fetching from ${feed.source}...`);
            const xml = await fetchRSS(feed.url);
            
            if (!xml || xml.length === 0) {
                console.log(`  Empty response from ${feed.source}`);
                continue;
            }
            
            console.log(`  Got ${xml.length} bytes from ${feed.source}`);
            
            const parsed = await parseRSS(xml);
            
            if (!parsed || !parsed.rss || !parsed.rss.channel) {
                console.log(`  No channel found in ${feed.source}`);
                continue;
            }
            
            const items = Array.isArray(parsed.rss.channel.item) 
                ? parsed.rss.channel.item 
                : parsed.rss.channel.item ? [parsed.rss.channel.item] : [];
            
            console.log(`  Found ${items.length} items from ${feed.source}`);
            
            items.slice(0, 5).forEach((item, index) => {
                if (!item.title) return;
                allArticles.push({
                    id: `rss_${feed.source.replace(/\s+/g, '_')}_${Date.now()}_${index}`,
                    title: item.title,
                    category: feed.category,
                    source: feed.source,
                    description: item.description ? item.description.toString().replace(/<[^>]*>/g, '').substring(0, 300) : 'No description',
                    link: item.link || '',
                    tags: extractTags((item.title || '') + ' ' + (item.description || '')),
                    date: item.pubDate || new Date().toISOString(),
                    trending: Math.random() > 0.7
                });
            });
            
            successCount++;
        } catch (err) {
            console.error(`  Error fetching ${feed.source}:`, err.message);
        }
    }
    
    console.log(`\nSuccessfully fetched from ${successCount}/${RSS_FEEDS.length} feeds`);
    console.log(`Total articles collected: ${allArticles.length}`);
    
    // Sort by date
    const sortedArticles = allArticles
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20);
    
    // Write to file
    const outputPath = 'data/news.json';
    fs.writeFileSync(outputPath, JSON.stringify(sortedArticles, null, 2));
    console.log(`Saved ${sortedArticles.length} news to ${outputPath}`);
    
    // Verify file was created
    if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`File size: ${stats.size} bytes`);
    }
}

main().catch(console.error);
