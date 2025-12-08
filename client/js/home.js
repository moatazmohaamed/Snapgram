const suggestions = [
  { name: "Emily White", user: "@emilywhite", avatar: "https://i.pravatar.cc/50?img=1", followed: false },
  { name: "Michael Chen", user: "@michaelchen", avatar: "https://i.pravatar.cc/50?img=5", followed: false },
  { name: "Sophie Park", user: "@sophiepark", avatar: "https://i.pravatar.cc/50?img=15", followed: false }
];

let posts = [
  {
    name: "Jane Smith",
    user: "@janesmith",
    avatar: "https://i.pravatar.cc/50?img=8",
    text: "This UI feels clean, minimal and youthful. Perfect for modern apps!",
    img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
    likes: 1200,
    liked: false,
    comments: [],
  },
  {
    name: "John Appleseed",
    user: "@johnappleseed",
    avatar: "https://i.pravatar.cc/50?img=12",
    text: "Minimalism is the future of UI/UX. Loving these new trends!",
    img: null,
    likes: 89,
    liked: false,
    comments: [],
  }
];

function renderSuggestions() {
  const box = document.getElementById("followList");
  if (!box) return;
  box.innerHTML = "";
  suggestions.forEach((s, i) => {
    box.innerHTML += `
      <div class="flex items-center justify-between p-3 xl:p-4 border-b border-border-light dark:border-slate-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <img src="${s.avatar}" class="size-8 xl:size-10 rounded-full shrink-0 ring-2 ring-slate-100 dark:ring-slate-800" alt="${s.name}" />
          <div class="min-w-0 flex-1">
            <p class="text-xs xl:text-sm font-bold text-text-primary-light dark:text-text-primary-dark truncate">${s.name}</p>
            <p class="text-xs text-text-secondary-light dark:text-slate-400 truncate">${s.user}</p>
          </div>
        </div>
        <button onclick="follow(${i})" class="flex items-center justify-center rounded-full h-7 xl:h-8 px-3 xl:px-4 ${s.followed ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-primary text-white'} text-xs font-bold hover:opacity-90 transition-opacity shrink-0">
          ${s.followed ? 'Following' : 'Follow'}
        </button>
      </div>
    `;
  });
}

function follow(i) {
  suggestions[i].followed = !suggestions[i].followed;
  renderSuggestions();
}

function renderFeed() {
  const feed = document.getElementById("feed");
  if (!feed) return;
  feed.innerHTML = "";
  posts.forEach((p, index) => {
    feed.innerHTML += `
      <article class="p-3 md:p-4 hover:bg-gray-50/50 dark:hover:bg-slate-900/50 transition-colors">
        <div class="flex gap-2 md:gap-4">
          <img src="${p.avatar}" class="size-8 md:size-10 rounded-full shrink-0 ring-2 ring-slate-100 dark:ring-slate-800" alt="${p.name}" />
          <div class="flex w-full flex-col items-stretch justify-center gap-1 md:gap-2">
            <div class="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2">
              <p class="text-text-primary-light dark:text-text-primary-dark text-sm md:text-base font-bold leading-tight">${p.name}</p>
              <p class="text-text-secondary-light dark:text-slate-400 text-xs md:text-sm font-normal leading-normal">${p.user} • 2h ago</p>
            </div>
            <div class="cursor-pointer" onclick="selectPost(${index})">
              <p class="text-text-primary-light dark:text-text-primary-dark text-sm md:text-base font-normal leading-relaxed mb-2">${p.text}</p>
              ${p.img ? `<img class="w-full aspect-video bg-cover rounded-xl shadow-sm" src="${p.img}" alt="Post image" />` : ""}
            </div>
            <div class="flex items-center justify-start gap-2 md:gap-4 -ml-1 md:-ml-2 mt-2">
              <button onclick="toggleLike(${index})" class="flex items-center justify-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 group transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4 md:size-5 ${p.liked ? 'text-red-500' : 'text-text-secondary-light dark:text-slate-400'} group-hover:text-red-500 transition-colors">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <p class="text-xs md:text-sm font-medium leading-normal ${p.liked ? 'text-red-500' : 'text-text-secondary-light dark:text-slate-400'} group-hover:text-red-500 transition-colors">${p.likes}</p>
              </button>
              <button onclick="openCommentBox(${index})" class="flex items-center justify-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 group transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4 md:size-5 text-text-secondary-light dark:text-slate-400 group-hover:text-blue-500 transition-colors">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                </svg>
                <p class="text-xs md:text-sm font-medium leading-normal text-text-secondary-light dark:text-slate-400 group-hover:text-blue-500 transition-colors">${p.comments.length}</p>
              </button>
              <button onclick="toggleShareMenu(${index})" class="flex items-center justify-center gap-1 md:gap-1.5 px-1.5 md:px-2 py-1 md:py-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 group transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4 md:size-5 text-text-secondary-light dark:text-slate-400 group-hover:text-green-500 transition-colors">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.51.48 1.2.77 1.96.77 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L7.05 11.9c-.51-.48-1.2-.77-1.96-.77-1.66 0-3 1.34-3 3s1.34 3 3 3c.76 0 1.44-.3 1.96-.77l7.05 4.11c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              </button>
            </div>
            ${p.showShareMenu ? `
              <div class="absolute top-20 right-5 bg-white dark:bg-slate-800 border border-border-light dark:border-slate-700 shadow-lg rounded-xl p-3 text-sm w-48 z-50">
                <button onclick="shareNative(${index})" class="w-full text-left py-2 px-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-text-primary-light dark:text-text-primary-dark transition-colors">
                  📱 Share (Phone)
                </button>
                <button onclick="shareToPage(${index})" class="w-full text-left py-2 px-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-text-primary-light dark:text-text-primary-dark transition-colors">
                  🔄 Share on your page
                </button>
                <button onclick="copyLink(${index})" class="w-full text-left py-2 px-3 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-text-primary-light dark:text-text-primary-dark transition-colors">
                  🔗 Copy Link
                </button>
              </div>
            ` : ""}
            ${p.showCommentBox ? `
              <div class="mt-3">
                <textarea id="commentInput-${index}" placeholder="Write a comment..." class="w-full border border-border-light dark:border-slate-700 rounded-xl p-2 text-sm outline-none mb-2 bg-white dark:bg-slate-900 text-text-primary-light dark:text-text-primary-dark focus:ring-2 focus:ring-primary"></textarea>
                <button onclick="addComment(${index})" class="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Comment</button>
              </div>
            ` : ""}
            ${p.comments.length > 0 ? `
              <div class="mt-3 flex flex-col gap-2">
                ${p.comments.map((c, ci) => `
                  <div class="bg-gray-100 dark:bg-slate-800 p-2 rounded-lg text-sm text-text-primary-light dark:text-text-primary-dark">
                    <div class="flex justify-between items-start">
                      <span>${c.text}</span>
                      <button onclick="replyComment(${index}, ${ci})" class="text-primary text-xs ml-2 hover:underline">Reply</button>
                    </div>
                    ${c.replies?.length > 0 ? `
                      <div class="ml-4 mt-2 flex flex-col gap-1">
                        ${c.replies.map(r => `<div class="bg-gray-200 dark:bg-slate-700 p-1.5 rounded-lg text-xs text-text-primary-light dark:text-text-primary-dark">${r}</div>`).join('')}
                      </div>
                    ` : ""}
                  </div>
                `).join('')}
              </div>
            ` : ""}
          </div>
        </div>
      </article>
    `;
  });
}

function selectPost(index) {
  localStorage.setItem('selectedPost', JSON.stringify(posts[index]));
  window.location.hash = '/post-details';
}

function toggleLike(i) {
  posts[i].liked = !posts[i].liked;
  posts[i].likes += posts[i].liked ? 1 : -1;
  renderFeed();
}

function openCommentBox(i) {
  posts[i].showCommentBox = !posts[i].showCommentBox;
  renderFeed();
}

function addComment(i) {
  const input = document.getElementById(`commentInput-${i}`);
  const text = input.value.trim();
  if (!text) return;
  if (!posts[i].comments) posts[i].comments = [];
  posts[i].comments.push({ text, replies: [] });
  input.value = "";
  renderFeed();
}

function replyComment(postIndex, commentIndex) {
  const reply = prompt("Write your reply:");
  if (!reply) return;
  posts[postIndex].comments[commentIndex].replies.push(reply);
  renderFeed();
}

function toggleShareMenu(i) {
  posts[i].showShareMenu = !posts[i].showShareMenu;
  renderFeed();
}

function shareNative(i) {
  if (navigator.share) {
    navigator.share({ title: "Check this post", text: posts[i].text, url: window.location.href });
  } else {
    alert("Your device does not support native sharing.");
  }
}

function shareToPage(i) {
  alert("The post was shared to your page!");
}

function copyLink(i) {
  navigator.clipboard.writeText(window.location.href);
  alert("Link copied!");
}

function addPost() {
  const text = document.getElementById("postText").value.trim();
  if (!text) return;
  posts.unshift({
    name: "Guest User",
    user: "@guest",
    avatar: "https://i.pravatar.cc/50?img=20",
    text,
    img: null,
    likes: 0,
    liked: false,
    comments: []
  });
  document.getElementById("postText").value = "";
  renderFeed();
}

export function init() {
  renderSuggestions();
  renderFeed();
}

if (typeof window !== 'undefined') {
  window.follow = follow;
  window.selectPost = selectPost;
  window.toggleLike = toggleLike;
  window.openCommentBox = openCommentBox;
  window.addComment = addComment;
  window.replyComment = replyComment;
  window.toggleShareMenu = toggleShareMenu;
  window.shareNative = shareNative;
  window.shareToPage = shareToPage;
  window.copyLink = copyLink;
  window.addPost = addPost;
}
