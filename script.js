class AITechHub {
    constructor() {
        this.techData = [];
        this.newsData = [];
        this.currentTechFilter = 'all';
        this.currentNewsFilter = 'all';
        this.currentTab = 'papers';
        this.notificationManager = new NotificationManager();
        this.dataFetcher = new DataFetcher(this);
        this.paperFetcher = new PaperFetcher(this);
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.notificationManager.init();
        this.updateStats();
        this.loadAllData();
    }

    async loadAllData() {
        // Load both papers and news from data folder (cho GitHub Pages)
        await this.dataFetcher.loadAllData();
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

        // Refresh tech/papers button
        document.getElementById('refreshTechBtn')?.addEventListener('click', () => {
            this.paperFetcher.fetchPapers(true);
        });

        // Add news button
        document.getElementById('addNewsBtn').addEventListener('click', () => {
            this.openNewsModal();
        });

        // Refresh news button - reload từ data folder
        document.getElementById('refreshNewsBtn')?.addEventListener('click', () => {
            this.dataFetcher.loadAllData();
            this.showNotification('Đang tải lại dữ liệu...');
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

    async loadAllData() {
        // Load both papers và news từ data folder
        await this.dataFetcher.loadAllData();
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

// Data Fetcher - Load data từ JSON files (cho GitHub Pages)
class DataFetcher {
    constructor(app) {
        this.app = app;
        this.dataUrl = 'data/';
    }

    async loadAllData() {
        console.log('Loading data from JSON files...');
        
        try {
            // Load papers
            const papersResponse = await fetch(`${this.dataUrl}papers.json`);
            if (papersResponse.ok) {
                const papers = await papersResponse.json();
                this.app.techData = papers;
                console.log('Loaded', papers.length, 'papers from data/papers.json');
            } else {
                console.log('No papers.json found, trying to fetch from arXiv directly...');
                // Fallback: thử fetch từ arXiv qua proxy
                await this.app.paperFetcher.loadPapers();
            }
            
            // Load news
            const newsResponse = await fetch(`${this.dataUrl}news.json`);
            if (newsResponse.ok) {
                const news = await newsResponse.json();
                this.app.newsData = news;
                console.log('Loaded', news.length, 'news from data/news.json');
            } else {
                console.log('No news.json found, using localStorage or empty');
            }
            
            this.app.saveData();
            this.app.renderTechCards();
            this.app.renderNewsCards();
            this.app.updateStats();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.app.showNotification('Lỗi tải dữ liệu. Sử dụng fallback.');
        }
    }
}

// Paper Fetcher Class - Tự động lấy papers từ arXiv API
class PaperFetcher {
    constructor(app) {
        this.app = app;
        this.CACHE_KEY = 'papersCache';
        this.CACHE_TIME_KEY = 'papersCacheTime';
        this.CACHE_DURATION = 60 * 60 * 1000; // 60 phút
    }

    async loadPapers() {
        // Nếu đã có papers trong localStorage, hiển thị trước
        if (this.app.techData.length > 0) {
            this.app.renderTechCards();
        }

        // Kiểm tra cache
        const cachedPapers = this.getCachedPapers();
        if (cachedPapers && !this.isCacheExpired()) {
            this.app.techData = cachedPapers;
            this.app.saveData();
            this.app.renderTechCards();
            this.app.updateStats();
            return;
        }

        // Fetch từ arXiv API
        await this.fetchPapers();
    }

    async fetchPapers(forceRefresh = false) {
        // Kiểm tra rate limit
        const lastFetch = localStorage.getItem('lastPapersFetch');
        const now = Date.now();
        if (!forceRefresh && lastFetch && (now - parseInt(lastFetch)) < 60000) {
            console.log('Rate limited: Chờ 1 phút giữa các lần fetch');
            return;
        }

        try {
            this.showLoading(true);
            console.log('Fetching papers from arXiv...');
            
            // Fetch papers từ arXiv API - các lĩnh vực AI/ML/CV/NLP
            const queries = [
                { term: 'cat:cs.AI', category: 'ai' },
                { term: 'cat:cs.CV', category: 'computer-vision' },
                { term: 'cat:cs.LG', category: 'machine-learning' },
                { term: 'cat:cs.CL', category: 'nlp' }
            ];
            
            const allPapers = [];
            
            for (const query of queries) {
                try {
                    // Sử dụng CORS proxy để bypass CORS error
                    const arxivUrl = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(query.term)}&sortBy=submittedDate&sortOrder=descending&max_results=5`;
                    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(arxivUrl)}`;
                    console.log('Fetching via proxy:', arxivUrl);
                    
                    const response = await fetch(proxyUrl);
                    console.log('Response status:', response.status);
                    
                    if (!response.ok) {
                        console.error('arXiv API error:', response.status, response.statusText);
                        continue;
                    }
                    
                    const xmlText = await response.text();
                    console.log('Got XML, length:', xmlText.length);
                    
                    // Parse XML
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                    const entries = xmlDoc.querySelectorAll('entry');
                    console.log('Found entries:', entries.length, 'for', query.category);
                    
                    entries.forEach((entry, index) => {
                        const paper = this.parseArxivEntry(entry, query.category, index);
                        if (paper) {
                            allPapers.push(paper);
                            console.log('Parsed paper:', paper.name.substring(0, 50));
                        }
                    });
                } catch (queryError) {
                    console.error('Error fetching query', query.term, ':', queryError);
                }
            }

            console.log('Total papers fetched:', allPapers.length);

            // Sắp xếp theo ngày và lấy 20 papers mới nhất
            const sortedPapers = allPapers.sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            ).slice(0, 20);

            // Merge với data hiện tại
            const existingLinks = new Set(this.app.techData.map(t => t.link));
            const newPapers = sortedPapers.filter(p => !existingLinks.has(p.link));
            
            if (newPapers.length > 0 || sortedPapers.length > 0) {
                this.app.techData = [...newPapers, ...this.app.techData]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 20);
                this.app.saveData();
                this.cachePapers(this.app.techData);
                
                this.app.showNotification(`Đã cập nhật ${newPapers.length || sortedPapers.length} papers mới!`);
            } else {
                this.app.showNotification('Không có papers mới');
            }

            localStorage.setItem('lastPapersFetch', now.toString());
            this.app.renderTechCards();
            this.app.updateStats();

        } catch (error) {
            console.error('Error fetching papers:', error);
            this.app.showNotification('Lỗi khi tải papers. Sử dụng dữ liệu local.');
            
            if (this.app.techData.length === 0) {
                this.loadFallbackPapers();
            }
        } finally {
            this.showLoading(false);
        }
    }

    parseArxivEntry(entry, category, index) {
        try {
            const title = entry.querySelector('title')?.textContent?.trim() || 'No title';
            const summary = entry.querySelector('summary')?.textContent?.trim() || 'No abstract';
            const published = entry.querySelector('published')?.textContent;
            const id = entry.querySelector('id')?.textContent;
            
            // Lấy authors
            const authors = Array.from(entry.querySelectorAll('author name')).map(a => a.textContent).slice(0, 3);
            const authorStr = authors.join(', ') + (entry.querySelectorAll('author').length > 3 ? ' et al.' : '');
            
            // Extract tags từ categories
            const categories = Array.from(entry.querySelectorAll('category')).map(c => c.getAttribute('term'));
            const tags = this.extractTags(categories.join(' ') + ' ' + title + ' ' + summary);
            
            return {
                id: `arxiv_${Date.now()}_${index}`,
                name: title,
                category: category,
                description: summary.substring(0, 200) + (summary.length > 200 ? '...' : ''),
                link: id || `https://arxiv.org/abs/${id?.split('/').pop()}`,
                tags: tags,
                date: published || new Date().toISOString(),
                trending: Math.random() > 0.7,
                source: `arXiv - ${authorStr}`
            };
        } catch (e) {
            console.error('Error parsing arXiv entry:', e);
            return null;
        }
    }

    extractTags(text) {
        const keywords = ['AI', 'Neural', 'Deep Learning', 'Machine Learning', 'Vision', 
                         'NLP', 'Transformer', 'GAN', 'CNN', 'RNN', 'LLM', 'GPT', 'BERT',
                         'Diffusion', 'Reinforcement Learning', 'Optimization', 'Robotics'];
        return keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase())).slice(0, 4);
    }

    getCachedPapers() {
        const cached = localStorage.getItem(this.CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    }

    cachePapers(papers) {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(papers));
        localStorage.setItem(this.CACHE_TIME_KEY, Date.now().toString());
    }

    isCacheExpired() {
        const cacheTime = localStorage.getItem(this.CACHE_TIME_KEY);
        if (!cacheTime) return true;
        return (Date.now() - parseInt(cacheTime)) > this.CACHE_DURATION;
    }

    loadFallbackPapers() {
        const fallbackPapers = [
            {
                id: 'fallback_1',
                name: 'Chưa có dữ liệu papers',
                category: 'ai',
                description: 'Nhấn nút "Cập nhật papers" để tải papers mới nhất từ arXiv.',
                link: 'https://arxiv.org/',
                tags: ['setup', 'arxiv'],
                date: new Date().toISOString(),
                trending: false,
                source: 'AI Tech Hub'
            }
        ];
        
        this.app.techData = fallbackPapers;
        this.app.saveData();
        this.app.renderTechCards();
        this.app.updateStats();
    }

    showLoading(show) {
        const container = document.getElementById('techContainer');
        if (!container) return;

        if (show) {
            const existing = container.querySelector('.loading-state');
            if (!existing) {
                container.insertAdjacentHTML('afterbegin', `
                    <div class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Đang tải papers...</p>
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
