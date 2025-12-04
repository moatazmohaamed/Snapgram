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
    },
    '/feed': {
        path: '../pages/feed.html',
        title: 'Feed'
    },
    '/saved': {
        path: '../pages/saved.html',
        title: 'Saved Posts'
    },
    '/users-admin': {
        path: '../admin/pages/dash-users.html',
        title: 'Users Management'
    },
    '/user-profile': {
        path: '../pages/user-profile.html',
        title: 'User Profile'
    },
    '/people': {
        path: '../pages/people.html',
        title: 'People'
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

        // reusable components
        const sidebarContainer = document.querySelector('#sidebar-container');
        if (sidebarContainer && window.componentLoader) {
            await window.componentLoader.insert('../components/sidebar.html', sidebarContainer);
        }

        const dashSidebarContainer = document.querySelector('#dash-sidebar');
        if (dashSidebarContainer && window.componentLoader) {
            await window.componentLoader.insert('../admin/components/dash-sidebar.html', dashSidebarContainer);
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