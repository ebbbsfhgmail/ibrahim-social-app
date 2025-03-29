// تكوين Firebase باستخدام بياناتك
const firebaseConfig = {
    apiKey: "AIzaSyB1UKd32M1JqpwTHC1xroGVG6297uL",
    authDomain: "adminhtml-41ea.firebaseapp.com",
    databaseURL: "https://adminhtml-41ea-default-rtdb.firebaseio.com",
    projectId: "adminhtml-41ea",
    storageBucket: "adminhtml-41ea.appspot.com",
    messagingSenderId: "491636187915",
    appId: "1:491636187915:web:80399e9a0fb2ab22cf780e",
    measurementId: "G-QSX21R7Z"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// دالة لعرض الإشعارات
function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.innerText = message;
    notification.style.display = "block";
    setTimeout(() => {
        notification.style.display = "none";
    }, 3000);
}

// إضافة منشور جديد
function addPost() {
    const postInput = document.getElementById("post-input").value;
    if (postInput.trim() === "") {
        alert("يرجى كتابة منشور!");
        return;
    }
    const postRef = database.ref("posts").push();
    postRef.set({
        content: postInput,
        timestamp: Date.now(),
        likes: 0,
        comments: {},
        reactions: {}
    }).then(() => {
        showNotification("تم إضافة منشور جديد!");
    });
    document.getElementById("post-input").value = "";
}

// متغيرات لتخزين البيانات مؤقتاً
let allPosts = [];
let totalLikes = 0;

// عرض المنشورات مع مؤشر التحميل وتحديث الإحصائيات
database.ref("posts").on("value", (snapshot) => {
    const postsList = document.getElementById("posts-list");
    const spinner = document.getElementById("loading-spinner");
    const postCount = document.getElementById("post-count");
    const likeCount = document.getElementById("like-count");
    spinner.style.display = "block";
    postsList.innerHTML = "";
    allPosts = [];
    totalLikes = 0;
    let postCounter = 0;

    snapshot.forEach((childSnapshot) => {
        const postId = childSnapshot.key;
        const post = childSnapshot.val();
        allPosts.push({ id: postId, ...post });
        postCounter++;
        totalLikes += post.likes || 0;

        const postElement = document.createElement("div");
        postElement.className = "post";
        postElement.setAttribute("data-id", postId);
        const date = new Date(post.timestamp).toLocaleString("ar-EG");
        const reactions = post.reactions ? Object.values(post.reactions).join(" ") : "";
        postElement.innerHTML = `
            <div class="post-header">
                <img src="https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg" alt="صورة المستخدم">
                <span>ابراهيم</span>
                <span class="post-time">${date}</span>
            </div>
            <p>${post.content}</p>
            <div class="post-actions">
                <button class="like-btn" onclick="likePost('${postId}', ${post.likes || 0})">
                    إعجاب (${post.likes || 0})
                </button>
                <button class="quick-like" onclick="quickLike('${postId}')">❤️</button>
                <select onchange="reactWithEmoji('${postId}', this.value)">
                    <option value="">تفاعل</option>
                    <option value="😊">😊</option>
                    <option value="❤️">❤️</option>
                    <option value="😂">😂</option>
                </select>
                <span>${reactions}</span>
                <button onclick="document.getElementById('comment-${postId}').style.display='block'">
                    تعليق
                </button>
            </div>
            <div class="comment-section">
                <textarea id="comment-${postId}" class="comment-input" placeholder="اكتب تعليقك..." style="display:none"></textarea>
                <button onclick="addComment('${postId}')">إرسال</button>
                <div id="comments-${postId}"></div>
            </div>
        `;
        postsList.appendChild(postElement);
        if (post.comments) {
            const commentsDiv = document.getElementById(`comments-${postId}`);
            Object.values(post.comments).forEach(comment => {
                const commentElement = document.createElement("div");
                commentElement.className = "comment";
                commentElement.innerText = comment;
                commentsDiv.appendChild(commentElement);
            });
        }
    });

    // تحديث الإحصائيات
    postCount.innerText = postCounter;
    likeCount.innerText = totalLikes;
    spinner.style.display = "none";
});

// إضافة إعجاب
function likePost(postId, currentLikes) {
    database.ref(`posts/${postId}`).update({
        likes: currentLikes + 1
    });
}

// إضافة إعجاب سريع
function quickLike(postId) {
    const post = allPosts.find(p => p.id === postId);
    const currentLikes = post.likes || 0;
    database.ref(`posts/${postId}`).update({
        likes: currentLikes + 1
    });
    const quickLikeBtn = document.querySelector(`.post[data-id="${postId}"] .quick-like`);
    quickLikeBtn.classList.add("liked");
}

// إضافة تعليق
function addComment(postId) {
    const commentInput = document.getElementById(`comment-${postId}`).value;
    if (commentInput.trim() === "") {
        alert("يرجى كتابة تعليق!");
        return;
    }
    const commentRef = database.ref(`posts/${postId}/comments`).push();
    commentRef.set(commentInput).then(() => {
        showNotification("تم إضافة تعليق جديد!");
    });
    document.getElementById(`comment-${postId}`).value = "";
    document.getElementById(`comment-${postId}`).style.display = "none";
}

// إضافة تفاعل بالرموز التعبيرية
function reactWithEmoji(postId, emoji) {
    if (emoji) {
        const reactionRef = database.ref(`posts/${postId}/reactions`).push();
        reactionRef.set(emoji);
    }
}

// تبديل الوضع الليلي
function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    const button = document.getElementById("theme-toggle");
    button.innerText = document.body.classList.contains("dark-mode") ? "الوضع النهاري" : "الوضع الليلي";
}

// البحث في المنشورات
function searchPosts() {
    const searchInput = document.getElementById("search-input").value.toLowerCase();
    const postsList = document.getElementById("posts-list");
    postsList.innerHTML = "";
    allPosts.forEach(post => {
        if (post.content.toLowerCase().includes(searchInput)) {
            const postElement = document.createElement("div");
            postElement.className = "post";
            postElement.setAttribute("data-id", post.id);
            const date = new Date(post.timestamp).toLocaleString("ar-EG");
            const reactions = post.reactions ? Object.values(post.reactions).join(" ") : "";
            postElement.innerHTML = `
                <div class="post-header">
                    <img src="https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg" alt="صورة المستخدم">
                    <span>ابراهيم</span>
                    <span class="post-time">${date}</span>
                </div>
                <p>${post.content}</p>
                <div class="post-actions">
                    <button class="like-btn" onclick="likePost('${post.id}', ${post.likes || 0})">
                        إعجاب (${post.likes || 0})
                    </button>
                    <button class="quick-like ${post.likes > 0 ? 'liked' : ''}" onclick="quickLike('${post.id}')">❤️</button>
                    <select onchange="reactWithEmoji('${post.id}', this.value)">
                        <option value="">تفاعل</option>
                        <option value="😊">😊</option>
                        <option value="❤️">❤️</option>
                        <option value="😂">😂</option>
                    </select>
                    <span>${reactions}</span>
                    <button onclick="document.getElementById('comment-${post.id}').style.display='block'">
                        تعليق
                    </button>
                </div>
                <div class="comment-section">
                    <textarea id="comment-${post.id}" class="comment-input" placeholder="اكتب تعليقك..." style="display:none"></textarea>
                    <button onclick="addComment('${post.id}')">إرسال</button>
                    <div id="comments-${post.id}"></div>
                </div>
            `;
            postsList.appendChild(postElement);
            if (post.comments) {
                const commentsDiv = document.getElementById(`comments-${post.id}`);
                Object.values(post.comments).forEach(comment => {
                    const commentElement = document.createElement("div");
                    commentElement.className = "comment";
                    commentElement.innerText = comment;
                    commentsDiv.appendChild(commentElement);
                });
            }
        }
    });
}

// تحديث المنشورات يدوياً
function refreshPosts() {
    const spinner = document.getElementById("loading-spinner");
    spinner.style.display = "block";
    database.ref("posts").once("value", (snapshot) => {
        // تحديث المنشورات يدوياً
        const postsList = document.getElementById("posts-list");
        postsList.innerHTML = "";
        allPosts = [];
        totalLikes = 0;
        let postCounter = 0;

        snapshot.forEach((childSnapshot) => {
            const postId = childSnapshot.key;
            const post = childSnapshot.val();
            allPosts.push({ id: postId, ...post });
            postCounter++;
            totalLikes += post.likes || 0;

            const postElement = document.createElement("div");
            postElement.className = "post";
            postElement.setAttribute("data-id", postId);
            const date = new Date(post.timestamp).toLocaleString("ar-EG");
            const reactions = post.reactions ? Object.values(post.reactions).join(" ") : "";
            postElement.innerHTML = `
                <div class="post-header">
                    <img src="https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg" alt="صورة المستخدم">
                    <span>ابراهيم</span>
                    <span class="post-time">${date}</span>
                </div>
                <p>${post.content}</p>
                <div class="post-actions">
                    <button class="like-btn" onclick="likePost('${postId}', ${post.likes || 0})">
                        إعجاب (${post.likes || 0})
                    </button>
                    <button class="quick-like ${post.likes > 0 ? 'liked' : ''}" onclick="quickLike('${postId}')">❤️</button>
                    <select onchange="reactWithEmoji('${postId}', this.value)">
                        <option value="">تفاعل</option>
                        <option value="😊">😊</option>
                        <option value="❤️">❤️</option>
                        <option value="😂">😂</option>
                    </select>
                    <span>${reactions}</span>
                    <button onclick="document.getElementById('comment-${postId}').style.display='block'">
                        تعليق
                    </button>
                </div>
                <div class="comment-section">
                    <textarea id="comment-${postId}" class="comment-input" placeholder="اكتب تعليقك..." style="display:none"></textarea>
                    <button onclick="addComment('${postId}')">إرسال</button>
                    <div id="comments-${postId}"></div>
                </div>
            `;
            postsList.appendChild(postElement);
            if (post.comments) {
                const commentsDiv = document.getElementById(`comments-${postId}`);
                Object.values(post.comments).forEach(comment => {
                    const commentElement = document.createElement("div");
                    commentElement.className = "comment";
                    commentElement.innerText = comment;
                    commentsDiv.appendChild(commentElement);
                });
            }
        });

        // تحديث الإحصائيات
        document.getElementById("post-count").innerText = postCounter;
        document.getElementById("like-count").innerText = totalLikes;
        spinner.style.display = "none";
        showNotification("تم تحديث المنشورات!");
    });
}

// تسجيل الخروج (وظيفة رمزية)
function logout() {
    if (confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟")) {
        showNotification("تم تسجيل الخروج بنجاح!");
        // يمكن إضافة وظيفة تسجيل الخروج الحقيقية مع Firebase Auth لاحقاً
    }
}

// زر التمرير إلى الأعلى
window.onscroll = function() {
    const scrollTopBtn = document.getElementById("scroll-top");
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scrollTopBtn.style.display = "block";
    } else {
        scrollTopBtn.style.display = "none";
    }
};
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}