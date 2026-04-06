# AI Tech Hub - Paper & News Tracking

Một web-app theo dõi công nghệ AI với 2 chức năng chính: Paper Tracking và News Tracking. Mỗi chức năng hiển thị 20 mục mới nhất với khả năng lọc và quản lý dễ dàng.

## 🚀 Tính năng

### Paper Tracking
- **Hiển thị 20 công nghệ mới nhất** theo thứ tự thời gian
- **Lọc theo danh mục**: AI, Computer Vision, Machine Learning, NLP
- **Thêm công nghệ mới** qua form dễ sử dụng
- **Tags và trending status** cho mỗi công nghệ

### News Tracking
- **Hiển thị 20 tin tức mới nhất** từ các nguồn công nghệ
- **Lọc theo danh mục**: AI News, Tech Giants, Research, Startups
- **Thêm tin tức mới** với nguồn tin và mô tả chi tiết
- **Tags và trending status** cho mỗi tin tức

### Tính năng chung
- **Giao diện responsive** hoạt động tốt trên mọi thiết bị
- **Thống kê tổng quan**: Papers, News, Hôm nay, Trending
- **Local Storage**: Lưu trữ dữ liệu ngay trên trình duyệt
- **Không cần đăng nhập**: Sử dụng hoàn toàn miễn phí
- **Tab navigation**: Chuyển đổi dễ dàng giữa 2 chức năng

## 🛠️ Công nghệ

- **HTML5**: Cấu trúc web với semantic tags
- **CSS3**: Thiết kế responsive với Grid, Flexbox, và CSS Variables
- **Vanilla JavaScript**: Xử lý logic và tương tác với ES6+ features
- **Font Awesome**: Icons cho giao diện
- **Local Storage API**: Lưu trữ dữ liệu client-side

## 📱 Giao diện

### Header
- Tiêu đề "AI Tech Hub" với gradient effect
- Mô tả ngắn về chức năng

### Tab Navigation
- **Paper Tracking**: Icon file-alt
- **News Tracking**: Icon newspaper
- Active state với animation

### Paper Tracking Section
- Filter buttons cho các danh mục AI
- Grid layout hiển thị 20 tech cards
- "Thêm công nghệ mới" button

### News Tracking Section
- Filter buttons cho các danh mục tin tức
- Grid layout hiển thị 20 news cards
- "Thêm tin tức mới" button

### Stats Section
- **Papers**: Tổng số công nghệ
- **News**: Tổng số tin tức
- **Hôm nay**: Số mục thêm trong ngày
- **Đang thịnh hành**: Số mục trending

### Modals
- **Tech Modal**: Form thêm công nghệ mới
- **News Modal**: Form thêm tin tức mới
- Validation và user feedback

## 🚀 Deploy lên GitHub Pages

### Bước 1: Tạo Repository

1. Vào [GitHub](https://github.com) và tạo repository mới
2. Đặt tên repository (ví dụ: `ai-tech-hub`)
3. Chọn **Public** để có thể deploy lên GitHub Pages
4. Click **Create repository**

### Bước 2: Upload files

1. Clone repository về máy:
```bash
git clone https://github.com/username/ai-tech-hub.git
cd ai-tech-hub
```

2. Copy tất cả files vào thư mục repository:
- `index.html`
- `styles.css`
- `script.js`
- `README.md`

3. Push lên GitHub:
```bash
git add .
git commit -m "Initial commit - AI Tech Hub App"
git push origin main
```

### Bước 3: Kích hoạt GitHub Pages

1. Vào repository trên GitHub
2. Click **Settings** tab
3. Scroll xuống mục **Pages**
4. Trong **Source**, chọn **Deploy from a branch**
5. Chọn **main** branch và **/ (root)**
6. Click **Save**

### Bước 4: Xem kết quả

Sau vài phút, web-app sẽ được deploy tại:
`https://username.github.io/ai-tech-hub/`

## 📝 Hướng dẫn sử dụng

### Paper Tracking

1. **Chuyển tab**: Click "Paper Tracking" tab
2. **Xem công nghệ**: Các công nghệ mới nhất hiển thị tự động
3. **Lọc theo danh mục**: Sử dụng filter buttons (AI, Computer Vision, etc.)
4. **Thêm công nghệ mới**:
   - Click "Thêm công nghệ mới"
   - Điền thông tin vào form:
     - **Tên công nghệ**: Tên của model/paper/công nghệ
     - **Danh mục**: Chọn AI, Computer Vision, Machine Learning, hoặc NLP
     - **Mô tả**: Mô tả ngắn gọn về công nghệ
     - **Link**: Link đến paper, bài viết, hoặc trang chính thức
     - **Tags**: Các tags liên quan, cách nhau bằng dấu phẩy
   - Click "Lưu công nghệ"

### News Tracking

1. **Chuyển tab**: Click "News Tracking" tab
2. **Xem tin tức**: Các tin tức mới nhất hiển thị tự động
3. **Lọc theo danh mục**: Sử dụng filter buttons (AI News, Tech Giants, etc.)
4. **Thêm tin tức mới**:
   - Click "Thêm tin tức mới"
   - Điền thông tin vào form:
     - **Tiêu đề tin tức**: Tiêu đề bài viết
     - **Danh mục**: Chọn AI News, Tech Giants, Research, hoặc Startups
     - **Nguồn tin**: Nguồn tin (VD: TechCrunch, OpenAI Blog)
     - **Nội dung tóm tắt**: Tóm tắt nội dung chính
     - **Link**: Link đến bài viết gốc
     - **Tags**: Các tags liên quan, cách nhau bằng dấu phẩy
   - Click "Lưu tin tức"

### Xem thống kê

- **Papers**: Tổng số công nghệ đã thêm
- **News**: Tổng số tin tức đã thêm
- **Hôm nay**: Số mục được thêm trong ngày (cả papers và news)
- **Đang thịnh hành**: Số mục được đánh dấu là trending

## 🎨 Tùy chỉnh

### Thay đổi màu sắc

Mở file `styles.css` và chỉnh sửa các biến CSS ở đầu file:

```css
:root {
    --primary-color: #667eea;    /* Màu chính */
    --secondary-color: #764ba2;  /* Màu phụ */
    --accent-color: #f093fb;     /* Màu nhấn */
    /* ... */
}
```

### Thay đổi số lượng items hiển thị

Mở file `script.js` và tìm hàm `renderTechCards()` và `renderNewsCards()`, thay đổi số `20`:

```javascript
const topTwenty = filteredData.slice(0, 30); // Hiển thị 30 mục
```

### Thêm danh mục mới

1. **Paper Categories**: Thêm button trong HTML, cập nhật JavaScript và CSS
2. **News Categories**: Tương tự với news filters

## 📊 Cấu trúc dữ liệu

### Tech Data Structure
```javascript
{
    id: "unique_id",
    name: "Tên công nghệ",
    category: "ai|computer-vision|machine-learning|nlp",
    description: "Mô tả chi tiết",
    link: "https://example.com/paper",
    tags: ["tag1", "tag2", "tag3"],
    date: "2024-01-01T00:00:00.000Z",
    trending: true|false
}
```

### News Data Structure
```javascript
{
    id: "unique_id",
    title: "Tiêu đề tin tức",
    category: "ai-news|tech-giants|research|startups",
    source: "Nguồn tin",
    description: "Nội dung tóm tắt",
    link: "https://example.com/news",
    tags: ["tag1", "tag2", "tag3"],
    date: "2024-01-01T00:00:00.000Z",
    trending: true|false
}
```

## 🔧 Khắc phục sự cố

### Dữ liệu không hiển thị

1. Kiểm tra console browser (F12) có lỗi JavaScript không
2. Xóa local storage và refresh lại trang:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
3. Kiểm tra các file có được load đúng không

### Responsive không hoạt động

1. Kiểm tra viewport meta tag trong HTML
2. Kiểm tra CSS media queries
3. Test trên các thiết bị khác nhau

### GitHub Pages không hoạt động

1. Kiểm tra file `index.html` có tồn tại không
2. Đợi vài phút để GitHub xử lý
3. Kiểm tra Settings > Pages có được kích hoạt không

### Tab switching không hoạt động

1. Kiểm tra event listeners trong JavaScript
2. Kiểm tra class names trong HTML và CSS
3. Verify tab data attributes

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa

## 🤝 Đóng góp

Mọi đóng góp và feedback đều được chào đón! 

### Areas for improvement:
- [ ] Add search functionality
- [ ] Implement data export/import
- [ ] Add dark mode
- [ ] Integrate with real APIs
- [ ] Add bookmarking feature
- [ ] Implement user accounts (optional)

---

**Built with ❤️ for AI Community**
