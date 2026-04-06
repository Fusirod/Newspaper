class AITechHub {
    constructor() {
        this.techData = this.loadData('techData');
        this.newsData = this.loadData('newsData');
        this.currentTechFilter = 'all';
        this.currentNewsFilter = 'all';
        this.currentTab = 'papers';
        this.notificationManager = new NotificationManager();
        this.newsFetcher = new NewsFetcher(this);
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.notificationManager.init();
        this.renderTechCards();
        this.updateStats();
        this.loadInitialData();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.tab-btn').dataset.tab);
            });
        });

        // Tech filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target.closest('.filter-btn'), 'tech');
                this.currentTechFilter = e.target.closest('.filter-btn').dataset.category;
                this.renderTechCards();
            });
        });

        // News filter buttons
        document.querySelectorAll('.news-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setActiveFilter(e.target.closest('.news-filter-btn'), 'news');
                this.currentNewsFilter = e.target.closest('.news-filter-btn').dataset.newsCategory;
                this.renderNewsCards();
            });
        });

        // Add tech button
        document.getElementById('addTechBtn').addEventListener('click', () => {
            this.openTechModal();
        });

        // Add news button
        document.getElementById('addNewsBtn').addEventListener('click', () => {
            this.openNewsModal();
        });

        // Refresh news button
        document.getElementById('refreshNewsBtn')?.addEventListener('click', () => {
            this.newsFetcher.fetchNews(true);
        });

        // Modal controls
        document.querySelector('.tech-close').addEventListener('click', () => {
            this.closeTechModal();
        });

        document.querySelector('.news-close').addEventListener('click', () => {
            this.closeNewsModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('addTechModal')) {
                this.closeTechModal();
            }
            if (e.target === document.getElementById('addNewsModal')) {
                this.closeNewsModal();
            }
        });

        // Form submissions
        document.getElementById('addTechForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewTech();
        });

        document.getElementById('addNewsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewNews();
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Section`).classList.add('active');

        this.currentTab = tabName;
    }

    setActiveFilter(activeBtn, type) {
        const selector = type === 'tech' ? '.filter-btn' : '.news-filter-btn';
        document.querySelectorAll(selector).forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    openTechModal() {
        document.getElementById('addTechModal').style.display = 'block';
    }

    closeTechModal() {
        document.getElementById('addTechModal').style.display = 'none';
        document.getElementById('addTechForm').reset();
    }

    openNewsModal() {
        document.getElementById('addNewsModal').style.display = 'block';
    }

    closeNewsModal() {
        document.getElementById('addNewsModal').style.display = 'none';
        document.getElementById('addNewsForm').reset();
    }

    addNewTech() {
        const formData = {
            id: Date.now().toString(),
            name: document.getElementById('techName').value,
            category: document.getElementById('techCategory').value,
            description: document.getElementById('techDescription').value,
            link: document.getElementById('techLink').value,
            tags: document.getElementById('techTags').value.split(',').map(tag => tag.trim()),
            date: new Date().toISOString(),
            trending: Math.random() > 0.7 // Random trending status
        };

        this.techData.unshift(formData);
        this.saveData();
        this.renderTechCards();
        this.updateStats();
        this.closeTechModal();
        this.showNotification('Công nghệ mới đã được thêm thành công!');
    }

    addNewNews() {
        const formData = {
            id: Date.now().toString(),
            title: document.getElementById('newsTitle').value,
            category: document.getElementById('newsCategory').value,
            source: document.getElementById('newsSource').value,
            description: document.getElementById('newsDescription').value,
            link: document.getElementById('newsLink').value,
            tags: document.getElementById('newsTags').value.split(',').map(tag => tag.trim()),
            date: new Date().toISOString(),
            trending: Math.random() > 0.7 // Random trending status
        };

        this.newsData.unshift(formData);
        this.saveData();
        this.renderNewsCards();
        this.updateStats();
        this.closeNewsModal();
        this.showNotification('Tin tức mới đã được thêm thành công!');
        
        // Gửi push notification
        this.notificationManager.showNotification(
            '📰 Tin tức mới!',
            formData.title,
            { type: 'news', id: formData.id, link: formData.link }
        );
    }

    renderTechCards() {
        const container = document.getElementById('techContainer');
        const filteredData = this.getFilteredData('tech');

        if (filteredData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>Chưa có công nghệ nào</h3>
                    <p>Hãy thêm công nghệ mới hoặc thử bộ lọc khác</p>
                </div>
            `;
            return;
        }

        // Display only top 20 technologies
        const topTwenty = filteredData.slice(0, 20);
        
        container.innerHTML = topTwenty.map(tech => `
            <div class="tech-card" data-category="${tech.category}">
                <div class="tech-header">
                    <div>
                        <h3 class="tech-title">${tech.name}</h3>
                        <span class="tech-category">${this.getCategoryLabel(tech.category)}</span>
                        ${tech.trending ? '<span class="tech-category" style="background: #ff6b6b; color: white; margin-left: 0.5rem;"><i class="fas fa-fire"></i> Hot</span>' : ''}
                    </div>
                </div>
                <p class="tech-description">${tech.description}</p>
                <div class="tech-tags">
                    ${tech.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                </div>
                <div class="tech-footer">
                    <span class="tech-date"><i class="fas fa-calendar"></i> ${this.formatDate(tech.date)}</span>
                    <a href="${tech.link}" target="_blank" class="tech-link">
                        Xem chi tiết <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `).join('');
    }

    renderNewsCards() {
        const container = document.getElementById('newsContainer');
        const filteredData = this.getFilteredData('news');

        if (filteredData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h3>Chưa có tin tức nào</h3>
                    <p>Hãy thêm tin tức mới hoặc thử bộ lọc khác</p>
                </div>
            `;
            return;
        }

        // Display only top 20 news
        const topTwenty = filteredData.slice(0, 20);
        
        container.innerHTML = topTwenty.map(news => `
            <div class="news-card" data-category="${news.category}">
                <div class="news-header">
                    <div>
                        <h3 class="news-title">${news.title}</h3>
                        <div>
                            <span class="news-source">${news.source}</span>
                            <span class="news-category">${this.getNewsCategoryLabel(news.category)}</span>
                            ${news.trending ? '<span class="news-category" style="background: #ff6b6b; color: white; margin-left: 0.5rem;"><i class="fas fa-fire"></i> Hot</span>' : ''}
                        </div>
                    </div>
                </div>
                <p class="news-description">${news.description}</p>
                <div class="news-tags">
                    ${news.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('')}
                </div>
                <div class="news-footer">
                    <span class="news-date"><i class="fas fa-calendar"></i> ${this.formatDate(news.date)}</span>
                    <a href="${news.link}" target="_blank" class="news-link">
                        Đọc thêm <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `).join('');
    }

    getFilteredData(type = 'tech') {
        if (type === 'tech') {
            if (this.currentTechFilter === 'all') {
                return this.techData;
            }
            return this.techData.filter(tech => tech.category === this.currentTechFilter);
        } else {
            if (this.currentNewsFilter === 'all') {
                return this.newsData;
            }
            return this.newsData.filter(news => news.category === this.currentNewsFilter);
        }
    }

    getCategoryLabel(category) {
        const labels = {
            'ai': 'AI',
            'computer-vision': 'Computer Vision',
            'machine-learning': 'Machine Learning',
            'nlp': 'NLP'
        };
        return labels[category] || category;
    }

    getNewsCategoryLabel(category) {
        const labels = {
            'ai-news': 'AI News',
            'tech-giants': 'Tech Giants',
            'research': 'Research',
            'startups': 'Startups'
        };
        return labels[category] || category;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
        return date.toLocaleDateString('vi-VN');
    }

    updateStats() {
        const paperCount = document.getElementById('paperCount');
        const newsCount = document.getElementById('newsCount');
        const todayCount = document.getElementById('todayCount');
        const trendingCount = document.getElementById('trendingCount');

        paperCount.textContent = this.techData.length;
        newsCount.textContent = this.newsData.length;

        const today = new Date().toDateString();
        const todayTechs = this.techData.filter(tech => 
            new Date(tech.date).toDateString() === today
        );
        const todayNews = this.newsData.filter(news => 
            new Date(news.date).toDateString() === today
        );
        todayCount.textContent = todayTechs.length + todayNews.length;

        const trendingTechs = this.techData.filter(tech => tech.trending);
        const trendingNews = this.newsData.filter(news => news.trending);
        trendingCount.textContent = trendingTechs.length + trendingNews.length;
    }

    loadData(type) {
        const savedData = localStorage.getItem(type);
        return savedData ? JSON.parse(savedData) : [];
    }

    saveData() {
        localStorage.setItem('techData', JSON.stringify(this.techData));
        localStorage.setItem('newsData', JSON.stringify(this.newsData));
    }

    async loadInitialData() {
        // Load tech data from sample if empty
        if (this.techData.length === 0) {
            this.loadSampleTechData();
        }
        
        // Load news from API or cache
        await this.newsFetcher.loadNews();
    }

    loadSampleTechData() {
        const sampleTechData = [
            {
                id: '1',
                name: 'GPT-4 Vision',
                category: 'ai',
                description: 'Mô hình ngôn ngữ lớn mới nhất của OpenAI với khả năng hiểu và xử lý hình ảnh, kết hợp văn bản và hình ảnh trong một lần xử lý.',
                link: 'https://openai.com/gpt-4',
                tags: ['multimodal', 'vision', 'llm', 'openai'],
                date: new Date(Date.now() - 86400000).toISOString(),
                trending: true
            },
            {
                id: '2',
                name: 'Segment Anything Model 2 (SAM 2)',
                category: 'computer-vision',
                description: 'Phiên bản nâng cấp của SAM với khả năng phân đoạn đối tượng thời gian thực trên video và hình ảnh.',
                link: 'https://segment-anything.com',
                tags: ['segmentation', 'real-time', 'video', 'meta'],
                date: new Date(Date.now() - 172800000).toISOString(),
                trending: true
            },
            {
                id: '3',
                name: 'LLaMA 3.1',
                category: 'ai',
                description: 'Mô hình ngôn ngữ mã nguồn mở mới nhất của Meta với hiệu suất vượt trội và khả năng reasoning cải thiện.',
                link: 'https://llama.meta.com',
                tags: ['llm', 'open-source', 'meta', 'reasoning'],
                date: new Date(Date.now() - 259200000).toISOString(),
                trending: false
            },
            {
                id: '4',
                name: 'Diffusion Transformers (DiT)',
                category: 'machine-learning',
                description: 'Kiến trúc mới cho diffusion models sử dụng transformers, đạt hiệu suất cao hơn trong image generation.',
                link: 'https://arxiv.org/abs/2212.09748',
                tags: ['diffusion', 'transformers', 'image-generation', 'research'],
                date: new Date(Date.now() - 345600000).toISOString(),
                trending: true
            },
            {
                id: '5',
                name: 'CLIP ViT-L/14',
                category: 'computer-vision',
                description: 'Phiên bản cải tiến của CLIP với Vision Transformer lớn hơn, khả năng hiểu text-image tốt hơn.',
                link: 'https://github.com/openai/CLIP',
                tags: ['clip', 'vision-transformer', 'multimodal', 'openai'],
                date: new Date(Date.now() - 432000000).toISOString(),
                trending: false
            },
            {
                id: '6',
                name: 'Bard Advanced',
                category: 'nlp',
                description: 'Phiên bản nâng cấp của Bard với Gemini Pro, khả năng xử lý đa ngôn ngữ và reasoning phức tạp.',
                link: 'https://bard.google.com',
                tags: ['nlp', 'gemini', 'google', 'multilingual'],
                date: new Date(Date.now() - 518400000).toISOString(),
                trending: true
            },
            {
                id: '7',
                name: 'Stable Diffusion XL Turbo',
                category: 'computer-vision',
                description: 'Phiên bản tối ưu của SDXL với tốc độ tạo ảnh nhanh gấp 2-4 lần mà không giảm chất lượng.',
                link: 'https://stability.ai',
                tags: ['stable-diffusion', 'image-generation', 'optimization'],
                date: new Date(Date.now() - 604800000).toISOString(),
                trending: false
            },
            {
                id: '8',
                name: 'Mistral 7B v0.2',
                category: 'ai',
                description: 'Mô hình 7B parameters hiệu suất cao, vượt trội so với các mô hình cùng kích thước.',
                link: 'https://mistral.ai',
                tags: ['llm', 'efficient', 'open-source', 'mistral'],
                date: new Date(Date.now() - 691200000).toISOString(),
                trending: true
            },
            {
                id: '9',
                name: 'YOLOv8',
                category: 'computer-vision',
                description: 'Phiên bản mới nhất của YOLO với độ chính xác và tốc độ được cải thiện, hỗ trợ đa nhiệm vụ.',
                link: 'https://github.com/ultralytics/ultralytics',
                tags: ['yolo', 'object-detection', 'real-time', 'ultralytics'],
                date: new Date(Date.now() - 777600000).toISOString(),
                trending: false
            },
            {
                id: '10',
                name: 'Phi-2',
                category: 'ai',
                description: 'Mô hình nhỏ nhưng mạnh mẽ của Microsoft, 2.7B parameters với khả năng reasoning đáng kinh ngạc.',
                link: 'https://huggingface.co/microsoft/phi-2',
                tags: ['small-model', 'reasoning', 'microsoft', 'efficient'],
                date: new Date(Date.now() - 864000000).toISOString(),
                trending: true
            }
        ];

        this.techData = sampleTechData;
        this.saveData();
        this.renderTechCards();
        this.updateStats();
    }

    loadSampleData() {
        // Deprecated - replaced by loadInitialData
        this.loadInitialData();
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// News Fetcher Class - Tự động lấy tin tức từ API
class NewsFetcher {
    constructor(app) {
        this.app = app;
        // Sử dụng NewsAPI - bạn cần đăng ký tại newsapi.org để lấy API key miễn phí
        this.API_KEY = localStorage.getItem('newsApiKey') || '';
        this.CACHE_KEY = 'newsCache';
        this.CACHE_TIME_KEY = 'newsCacheTime';
        this.CACHE_DURATION = 30 * 60 * 1000; // 30 phút
    }

    // Kiểm tra xem có API key không
    hasApiKey() {
        return this.API_KEY && this.API_KEY.length > 0;
    }

    // Lưu API key
    setApiKey(key) {
        this.API_KEY = key;
        localStorage.setItem('newsApiKey', key);
    }

    async loadNews() {
        // Nếu đã có news trong localStorage, hiển thị trước
        if (this.app.newsData.length > 0) {
            this.app.renderNewsCards();
        }

        // Kiểm tra cache
        const cachedNews = this.getCachedNews();
        if (cachedNews && !this.isCacheExpired()) {
            this.app.newsData = cachedNews;
            this.app.saveData();
            this.app.renderNewsCards();
            this.app.updateStats();
            return;
        }

        // Nếu không có API key, dùng sample data hoặc đã có sẵn
        if (!this.hasApiKey()) {
            console.log('NewsAPI key not configured. Using local data or sample data.');
            if (this.app.newsData.length === 0) {
                this.loadFallbackNews();
            }
            return;
        }

        // Fetch từ API
        await this.fetchNews();
    }

    async fetchNews(forceRefresh = false) {
        if (!this.hasApiKey()) {
            this.app.showNotification('Vui lòng cấu hình NewsAPI key trong settings!');
            return;
        }

        // Kiểm tra rate limit
        const lastFetch = localStorage.getItem('lastNewsFetch');
        const now = Date.now();
        if (!forceRefresh && lastFetch && (now - parseInt(lastFetch)) < 60000) {
            console.log('Rate limited: Chờ 1 phút giữa các lần fetch');
            return;
        }

        try {
            this.showLoading(true);
            
            // Fetch tin tức AI/Technology từ NewsAPI
            const queries = [
                'artificial intelligence',
                'machine learning',
                'OpenAI',
                'Google AI',
                'Microsoft AI'
            ];
            
            const allArticles = [];
            
            for (const query of queries.slice(0, 2)) { // Giới hạn 2 queries để tránh quota
                const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=10&apiKey=${this.API_KEY}`;
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.status === 'ok' && data.articles) {
                    allArticles.push(...data.articles);
                }
            }

            // Loại bỏ trùng lặp và chuyển đổi format
            const uniqueArticles = this.removeDuplicates(allArticles);
            const newsData = uniqueArticles.map((article, index) => this.convertToNewsFormat(article, index));

            // Merge với data hiện tại, ưu tiên tin mới
            const existingLinks = new Set(this.app.newsData.map(n => n.link));
            const newArticles = newsData.filter(n => !existingLinks.has(n.link));
            
            if (newArticles.length > 0) {
                this.app.newsData = [...newArticles.slice(0, 10), ...this.app.newsData].slice(0, 50);
                this.app.saveData();
                this.cacheNews(this.app.newsData);
                
                // Gửi notification nếu có tin mới
                if (this.app.notificationManager) {
                    this.app.notificationManager.showNotification(
                        '📰 Tin tức mới!',
                        `Có ${newArticles.length} tin tức mới được cập nhật`,
                        { type: 'news', count: newArticles.length }
                    );
                }
                
                this.app.showNotification(`Đã cập nhật ${newArticles.length} tin tức mới!`);
            } else {
                this.app.showNotification('Không có tin tức mới');
            }

            localStorage.setItem('lastNewsFetch', now.toString());
            this.app.renderNewsCards();
            this.app.updateStats();

        } catch (error) {
            console.error('Error fetching news:', error);
            this.app.showNotification('Lỗi khi tải tin tức. Sử dụng dữ liệu local.');
            
            if (this.app.newsData.length === 0) {
                this.loadFallbackNews();
            }
        } finally {
            this.showLoading(false);
        }
    }

    convertToNewsFormat(article, index) {
        // Xác định category dựa trên nội dung
        let category = 'ai-news';
        const title = (article.title || '').toLowerCase();
        const desc = (article.description || '').toLowerCase();
        
        if (title.includes('google') || title.includes('microsoft') || title.includes('nvidia') || 
            title.includes('amazon') || title.includes('meta') || title.includes('apple')) {
            category = 'tech-giants';
        } else if (title.includes('research') || title.includes('study') || title.includes('paper') ||
                   desc.includes('research') || desc.includes('arxiv')) {
            category = 'research';
        } else if (title.includes('startup') || title.includes('funding') || title.includes('million') ||
                   title.includes('billion') || title.includes('invest')) {
            category = 'startups';
        }

        return {
            id: `api_${Date.now()}_${index}`,
            title: article.title || 'No title',
            category: category,
            source: article.source?.name || 'Unknown',
            description: article.description || article.content || 'No description available',
            link: article.url,
            tags: this.extractTags(article.title + ' ' + article.description),
            date: article.publishedAt || new Date().toISOString(),
            trending: Math.random() > 0.7,
            imageUrl: article.urlToImage
        };
    }

    extractTags(text) {
        const keywords = ['AI', 'OpenAI', 'Google', 'Microsoft', 'Meta', 'NVIDIA', 'ChatGPT', 
                         'GPT', 'LLM', 'Machine Learning', 'Neural', 'Deep Learning',
                         'Chatbot', 'Automation', 'Robot', 'Vision', 'NLP'];
        return keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase())).slice(0, 4);
    }

    removeDuplicates(articles) {
        const seen = new Set();
        return articles.filter(article => {
            const key = article.url || article.title;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    getCachedNews() {
        const cached = localStorage.getItem(this.CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    }

    cacheNews(news) {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(news));
        localStorage.setItem(this.CACHE_TIME_KEY, Date.now().toString());
    }

    isCacheExpired() {
        const cacheTime = localStorage.getItem(this.CACHE_TIME_KEY);
        if (!cacheTime) return true;
        return (Date.now() - parseInt(cacheTime)) > this.CACHE_DURATION;
    }

    loadFallbackNews() {
        // Fallback data khi không có API key hoặc lỗi
        const fallbackNews = [
            {
                id: 'fallback_1',
                title: 'Cấu hình NewsAPI để tự động cập nhật tin tức',
                category: 'ai-news',
                source: 'AI Tech Hub',
                description: 'Đăng ký tài khoản miễn phí tại newsapi.org để nhận API key và tự động cập nhật tin tức AI mới nhất.',
                link: 'https://newsapi.org/register',
                tags: ['setup', 'api', 'configuration'],
                date: new Date().toISOString(),
                trending: false
            }
        ];
        
        this.app.newsData = fallbackNews;
        this.app.saveData();
        this.app.renderNewsCards();
        this.app.updateStats();
    }

    showLoading(show) {
        const container = document.getElementById('newsContainer');
        if (!container) return;

        if (show) {
            const existing = container.querySelector('.loading-state');
            if (!existing) {
                container.insertAdjacentHTML('afterbegin', `
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Đang tải tin tức...</p>
                    </div>
                `);
            }
        } else {
            const loading = container.querySelector('.loading-state');
            if (loading) loading.remove();
        }
    }
}

// Notification Manager Class
class NotificationManager {
    constructor() {
        this.swRegistration = null;
        this.isSupported = 'serviceWorker' in navigator && 'Notification' in window;
        this.toggleElement = document.getElementById('notificationToggle');
        this.notificationCard = document.querySelector('.notification-card');
    }

    async init() {
        if (!this.isSupported) {
            this.disableToggle('Trình duyệt không hỗ trợ');
            return;
        }

        // Đăng ký Service Worker
        try {
            this.swRegistration = await navigator.serviceWorker.register('sw.js');
            console.log('Service Worker registered:', this.swRegistration);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
            this.disableToggle('Lỗi đăng ký SW');
            return;
        }

        // Lắng nghe message từ Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data.type === 'NOTIFICATION_CLICKED') {
                this.handleNotificationClick(event.data.data);
            }
        });

        // Khôi phục trạng thái từ localStorage
        this.restoreState();

        // Thêm event listener cho toggle
        this.toggleElement.addEventListener('change', () => this.handleToggle());
    }

    disableToggle(reason) {
        if (this.toggleElement) {
            this.toggleElement.disabled = true;
        }
        if (this.notificationCard) {
            this.notificationCard.classList.add('disabled');
            const span = this.notificationCard.querySelector('.notification-info span');
            if (span) {
                span.textContent = `Thông báo (${reason})`;
            }
        }
    }

    restoreState() {
        const enabled = localStorage.getItem('notificationsEnabled') === 'true';
        if (this.toggleElement) {
            this.toggleElement.checked = enabled;
        }
        if (enabled) {
            this.requestPermission();
        }
    }

    async handleToggle() {
        const enabled = this.toggleElement.checked;
        localStorage.setItem('notificationsEnabled', enabled);

        if (enabled) {
            const granted = await this.requestPermission();
            if (!granted) {
                this.toggleElement.checked = false;
                localStorage.setItem('notificationsEnabled', 'false');
            } else {
                this.showNotification('Thông báo đã được bật!', 'Bạn sẽ nhận được thông báo khi có tin tức mới.');
            }
        }
    }

    async requestPermission() {
        if (!this.isSupported) return false;

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    async showNotification(title, body, data = null) {
        if (!this.isSupported) return;

        // Kiểm tra permission
        if (Notification.permission !== 'granted') {
            console.log('Notification permission not granted');
            return;
        }

        // Kiểm tra toggle có được bật không
        if (!this.toggleElement?.checked) return;

        // Kiểm tra app đang active không
        if (document.visibilityState === 'visible') {
            // App đang mở - không gửi notification để tránh spam
            return;
        }

        // Gửi message đến Service Worker
        if (this.swRegistration && this.swRegistration.active) {
            this.swRegistration.active.postMessage({
                type: 'SHOW_NOTIFICATION',
                payload: {
                    title: title,
                    body: body,
                    icon: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/svgs/solid/bell.svg',
                    data: data
                }
            });
        }
    }

    handleNotificationClick(data) {
        // Chuyển đến tab news nếu là tin tức
        if (data && data.type === 'news') {
            // Dispatch custom event để chuyển tab
            window.dispatchEvent(new CustomEvent('switchToNewsTab'));
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AITechHub();
});

// Add CSS fix for background-clip compatibility
const style = document.createElement('style');
style.textContent = `
    header h1 {
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
`;
document.head.appendChild(style);
