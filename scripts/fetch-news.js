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
    // AI News
    { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch', category: 'ai-news' },
    { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', source: 'The Verge', category: 'ai-news' },
    { url: 'https://www.technologyreview.com/feed/', source: 'MIT Tech Review', category: 'ai-news' },
    { url: 'https://arstechnica.com/feed/', source: 'Ars Technica', category: 'ai-news' },
    { url: 'https://www.wired.com/feed/tag/ai/latest/rss', source: 'Wired', category: 'ai-news' },
    // Startups
    { url: 'https://venturebeat.com/feed/', source: 'VentureBeat', category: 'startups' },
    { url: 'https://techcrunch.com/startups/feed/', source: 'TechCrunch Startups', category: 'startups' },
    { url: 'https://www.entrepreneur.com/latest.rss', source: 'Entrepreneur', category: 'startups' },
    { url: 'https://inc.com/rss', source: 'Inc', category: 'startups' },
    // Research
    { url: 'https://www.science.org/rss/news_current.xml', source: 'Science', category: 'research' },
    { url: 'https://www.nature.com/nature.rss', source: 'Nature', category: 'research' },
    { url: 'https://distill.pub/rss.xml', source: 'Distill', category: 'research' },
    // Tech Giants
    { url: 'https://blog.google/technology/ai/rss/', source: 'Google AI', category: 'tech-giants' },
    { url: 'https://openai.com/blog/rss.xml', source: 'OpenAI', category: 'tech-giants' }
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
    
    // Group articles by category
    const articlesByCategory = {};
    allArticles.forEach(article => {
        if (!articlesByCategory[article.category]) {
            articlesByCategory[article.category] = [];
        }
        articlesByCategory[article.category].push(article);
    });
    
    // Log số lượng mỗi category
    Object.keys(articlesByCategory).forEach(cat => {
        console.log(`  ${cat}: ${articlesByCategory[cat].length} articles`);
    });
    
    // Đảm bảo mỗi category có tối thiểu 4 bài (nếu có), tối đa 30 bài tổng cộng
    const MIN_PER_CATEGORY = 4;
    const MAX_TOTAL = 30;
    const categories = ['ai-news', 'tech-giants', 'research', 'startups'];
    const finalArticles = [];
    
    // Bước 1: Lấy tối thiểu 4 bài từ mỗi category
    categories.forEach(cat => {
        const catArticles = articlesByCategory[cat] || [];
        // Sort by date
        catArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
        // Lấy tối thiểu 4 bài
        const selected = catArticles.slice(0, MIN_PER_CATEGORY);
        finalArticles.push(...selected);
    });
    
    // Bước 2: Nếu còn chỗ, lấy thêm bài từ các category có nhiều bài nhất
    let remainingSlots = MAX_TOTAL - finalArticles.length;
    if (remainingSlots > 0) {
        // Lấy các bài chưa được chọn
        const selectedIds = new Set(finalArticles.map(a => a.id));
        const remainingArticles = allArticles.filter(a => !selectedIds.has(a.id));
        // Sort by date
        remainingArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
        // Lấy thêm đến khi đủ 30
        finalArticles.push(...remainingArticles.slice(0, remainingSlots));
    }
    
    // Sort tất cả theo date
    finalArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Log kết quả cuối
    const finalByCat = {};
    finalArticles.forEach(a => {
        finalByCat[a.category] = (finalByCat[a.category] || 0) + 1;
    });
    console.log(`\nFinal distribution (total ${finalArticles.length}):`);
    Object.keys(finalByCat).forEach(cat => {
        console.log(`  ${cat}: ${finalByCat[cat]} articles`);
    });
    
    const outputPath = 'data/news.json';
    fs.writeFileSync(outputPath, JSON.stringify(finalArticles, null, 2));
    console.log(`Saved ${finalArticles.length} news to ${outputPath}`);
    
    // Verify file was created
    if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`File size: ${stats.size} bytes`);
    }
    
    // Thoát với code 0 dù có lỗi hay không
    process.exit(0);
}

main();
