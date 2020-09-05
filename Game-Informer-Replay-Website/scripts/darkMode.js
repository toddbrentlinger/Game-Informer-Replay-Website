// Dark Mode Switch
const currentTheme = window.localStorage.getItem('theme');
if (currentTheme || window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', currentTheme);
}

document.addEventListener("DOMContentLoaded", function () {
    const darkModeSwitch = document.getElementById('dark-mode-checkbox');
    if (currentTheme) {
        //document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme == 'dark')
            darkModeSwitch.checked = 'true';
    }
    darkModeSwitch.addEventListener('click', function (event) {
        if (event.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            window.localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            window.localStorage.setItem('theme', 'light');
        }
    }, false);
}, false);