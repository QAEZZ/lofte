const sidebar_toggle = document.getElementById('js-toggle-sidebar');
const sidebar = document.getElementById('js-sidebar');
const sidebar_resize = document.getElementById('js-resize');

sidebar_toggle.addEventListener('click', function () {
    sidebar_resize.classList.toggle('hidden');

    if (sidebar.classList.contains('collapsed')) {
        sidebar.style.width = 'max-content';
        sidebar.classList.remove('collapsed');
    } else {
        sidebar.style.width = '0';
        sidebar.classList.add('collapsed');
    }
});
