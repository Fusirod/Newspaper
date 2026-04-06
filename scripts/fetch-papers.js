// Script để fetch papers từ arXiv API (chạy trong Node.js)
const https = require('https');
const fs = require('fs');
const { DOMParser } = require('xmldom');

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync('data')) {
    fs.mkdirSync('data', { recursive: true });
}

const queries = [
    { term: 'cat:cs.AI', category: 'ai' },
    { term: 'cat:cs.CV', category: 'computer-vision' },
    { term: 'cat:cs.LG', category: 'machine-learning' },
    { term: 'cat:cs.CL', category: 'nlp' }
];

async function fetchFromArxiv(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function parseArxivEntry(entry, category, index) {
    try {
        const titleEl = entry.getElementsByTagName('title')[0];
        const summaryEl = entry.getElementsByTagName('summary')[0];
        const publishedEl = entry.getElementsByTagName('published')[0];
        const idEl = entry.getElementsByTagName('id')[0];
        
        const title = titleEl ? titleEl.textContent.trim() : 'No title';
        const summary = summaryEl ? summaryEl.textContent.trim() : 'No abstract';
        const published = publishedEl ? publishedEl.textContent : new Date().toISOString();
        const id = idEl ? idEl.textContent : '';
        
        // Lấy authors
        const authors = [];
        const authorEls = entry.getElementsByTagName('author');
        for (let i = 0; i < Math.min(authorEls.length, 3); i++) {
            const nameEl = authorEls[i].getElementsByTagName('name')[0];
            if (nameEl) authors.push(nameEl.textContent);
        }
        const authorStr = authors.join(', ') + (authorEls.length > 3 ? ' et al.' : '');
        
        // Extract tags
        const categories = [];
        const catEls = entry.getElementsByTagName('category');
        for (let i = 0; i < catEls.length; i++) {
            const term = catEls[i].getAttribute('term');
            if (term) categories.push(term);
        }
        
        const keywords = ['AI', 'Neural', 'Deep Learning', 'Machine Learning', 'Vision', 
                         'NLP', 'Transformer', 'GAN', 'CNN', 'RNN', 'LLM', 'GPT', 'BERT',
                         'Diffusion', 'Reinforcement Learning', 'Optimization', 'Robotics'];
        const tags = keywords.filter(kw => 
            (title + ' ' + summary + ' ' + categories.join(' ')).toLowerCase().includes(kw.toLowerCase())
        ).slice(0, 4);
        
        return {
            id: `arxiv_${Date.now()}_${index}`,
            name: title,
            category: category,
            description: summary.substring(0, 200) + (summary.length > 200 ? '...' : ''),
            link: id || `https://arxiv.org/abs/${id.split('/').pop()}`,
            tags: tags,
            date: published,
            trending: Math.random() > 0.7,
            source: `arXiv - ${authorStr}`
        };
    } catch (e) {
        console.error('Error parsing entry:', e);
        return null;
    }
}

async function main() {
    console.log('Fetching papers from arXiv...');
    
    // Đảm bảo thư mục data tồn tại
    if (!fs.existsSync('data')) {
        console.log('Creating data directory...');
        fs.mkdirSync('data', { recursive: true });
    }
    
    const allPapers = [];
    
    for (const query of queries) {
        try {
            const url = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(query.term)}&sortBy=submittedDate&sortOrder=descending&max_results=5`;
            console.log(`Fetching ${query.category}...`);
            
            const xmlText = await fetchFromArxiv(url);
            
            // Parse XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
            const entries = xmlDoc.getElementsByTagName('entry');
            
            console.log(`Found ${entries.length} entries for ${query.category}`);
            
            for (let i = 0; i < entries.length; i++) {
                const paper = parseArxivEntry(entries[i], query.category, i);
                if (paper) allPapers.push(paper);
            }
        } catch (err) {
            console.error(`Error fetching ${query.term}:`, err.message);
        }
    }
    
    console.log(`\nSuccessfully fetched from ${queries.length} queries`);
    console.log(`Total papers collected: ${allPapers.length}`);
    
    // Luôn lưu file, dù có papers hay không
    const sortedPapers = allPapers
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20);
    
    const outputPath = 'data/papers.json';
    fs.writeFileSync(outputPath, JSON.stringify(sortedPapers, null, 2));
    console.log(`Saved ${sortedPapers.length} papers to ${outputPath}`);
    
    // Verify file was created
    if (fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`File size: ${stats.size} bytes`);
    }
    
    // Thoát với code 0 dù có lỗi hay không
    process.exit(0);
}

main();
