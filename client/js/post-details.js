function renderPost() {
  const post = JSON.parse(localStorage.getItem('selectedPost'));
  if (!post) return;

  const container = document.getElementById("postContainer");
  if (!container) return;

  container.innerHTML = `
    <div class="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
      <div class="flex items-center gap-4 mb-4">
        <img src="${post.avatar}" class="w-12 h-12 rounded-full border shadow-sm" />
        <div>
          <p class="font-bold text-gray-800">${post.name}</p>
          <p class="text-gray-500 text-sm">${post.user} • 2h ago</p>
        </div>
      </div>
      <p class="text-gray-700 leading-6 mb-4">${post.text}</p>
      ${post.img ? `<img src="${post.img}" class="rounded-xl shadow-sm mb-4"/>` : ""}
      <div class="flex gap-10 text-gray-600 font-medium items-center mb-4">
        <span>❤️ ${post.likes}</span>
        <span>💬 ${post.comments.length}</span>
      </div>
      <div>
        <h3 class="font-semibold text-gray-700 mb-2">Comments:</h3>
        ${post.comments.length > 0 ? post.comments.map(c => `
          <div class="bg-gray-100 p-2 rounded-lg mb-2">
            <div>${c.text}</div>
            ${c.replies?.length > 0 ? c.replies.map(r => `<div class="ml-4 text-gray-700 text-sm">${r}</div>`).join('') : ""}
          </div>
        `).join('') : "<p class='text-gray-500'>No comments yet.</p>"}
      </div>
    </div>
  `;
}

export function init() {
  renderPost();
}
