const router = (event) => {
    event = event || window.event;
    event.preventDefault();
    const href = event.target.getAttribute('href');
    window.location.hash = href;
}

const routes = {
    '/': {
        path: '../pages/sign-in.html',
        title: 'Sign In'
    },
    '/sign-in': {
        path: '../pages/sign-in.html',
        title: 'Sign In'
    },
    '/sign-up': {
        path: '../pages/sign-up.html',
        title: 'Sign Up'
    },
    '404': {
        path: '../pages/404.html',
        title: 'Not Found'
    }
}


const handleLocation = async () => {
    let path = window.location.hash.slice(1) || '/';
    const route = routes[path] || routes['404'];

    try {
        const response = await fetch(route.path);
        if (!response.ok) {
            throw new Error('Page not found');
        }
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const root = document.getElementById('root');
        if (root) {
            root.innerHTML = doc.body.innerHTML;
        } else {
            console.error('Root element not found');
        }

        document.title = route.title;
    } catch (error) {
        console.error('Navigation error:', error);
        if (route.path !== routes['404'].path) {
            window.location.hash = '/404';
        }
    }
}



window.addEventListener('hashchange', handleLocation);
window.addEventListener('load', handleLocation);
window.route = router;