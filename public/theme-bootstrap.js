(function () {
  try {
    var t = localStorage.getItem('stashchat:theme');
    if (t !== 'light' && t !== 'dark' && t !== 'system') t = 'system';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
