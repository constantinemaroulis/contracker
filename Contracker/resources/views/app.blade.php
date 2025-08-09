<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="mobile-web-app-status-bar-style" content="default">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 min-h-full">
        <nav class="sticky top-0 z-40 bg-white/70 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 backdrop-blur">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <span class="font-semibold text-lg">{{ config('app.name', 'Laravel') }}</span>
                <button id="theme-toggle" class="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring">
                    <svg id="theme-toggle-dark-icon" class="hidden w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.02 6.36-.7-.7M6.34 6.34l-.7-.7m12.02 0-.7.7M6.34 17.66l-.7.7M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
                    <svg id="theme-toggle-light-icon" class="hidden w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-4 6a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm8-7a1 1 0 100 2h1a1 1 0 100-2h-1zM3 11a1 1 0 100-2H2a1 1 0 100 2h1zm12.071 4.071a1 1 0 011.415 1.415l-.707.707a1 1 0 01-1.415-1.415l.707-.707zM5.636 5.636a1 1 0 011.415-1.415l.707.707A1 1 0 016.343 6.343l-.707-.707zm10.607-1.415a1 1 0 00-1.415 1.415l.707.707a1 1 0 001.415-1.415l-.707-.707zM5.636 14.364a1 1 0 00-1.415 1.415l.707.707a1 1 0 001.415-1.415l-.707-.707z"/></svg>
                </button>
            </div>
        </nav>
        <main class="min-h-[calc(100vh-4rem)]">
            @inertia
        </main>
        <script>
            const themeToggleBtn = document.getElementById('theme-toggle');
            const darkIcon = document.getElementById('theme-toggle-dark-icon');
            const lightIcon = document.getElementById('theme-toggle-light-icon');

            function updateIcons() {
                const isDark = document.documentElement.classList.contains('dark');
                lightIcon.classList.toggle('hidden', !isDark);
                darkIcon.classList.toggle('hidden', isDark);
            }

            function setTheme(theme) {
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                localStorage.setItem('theme', theme);
                updateIcons();
            }

            themeToggleBtn.addEventListener('click', () => {
                const isDark = document.documentElement.classList.contains('dark');
                setTheme(isDark ? 'light' : 'dark');
            });

            const storedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(storedTheme ? storedTheme : (prefersDark ? 'dark' : 'light'));
        </script>
    </body>
</html>
