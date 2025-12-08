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
        path: '../pages/home.html',
        title: 'Home'
    },
    '/home': {
        path: '../pages/home.html',
        title: 'Home'
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
    },
    '/forgot-password': {
        path: '../pages/forget.html',
        title: 'Forgot Password'
    },
    '/verify': {
        path: '../pages/verify.html',
        title: 'Verify Code'
    },
    '/post-details': {
        path: '../pages/post-details.html',
        title: 'Post Details'
    },
    '/settings': {
        path: '../pages/setting.html',
        title: 'Settings'
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

        const scriptsToLoad = doc.querySelectorAll("script[type='module'][src]");
        for (const script of scriptsToLoad) {
            try {
                const module = await import(script.src);
                if (module.init) {
                    module.init();
                }
            } catch (err) {
                console.warn(`Failed to load or initialize module from ${script.src}:`, err);
            }
        }


        const sidebarContainer = document.querySelector('#sidebar-container');
        if (sidebarContainer && window.componentLoader) {
            await window.componentLoader.insert('../components/sidebar.html', sidebarContainer);
        }

        const mobileNavContainer = document.querySelector('#mobile-nav-container');
        if (mobileNavContainer && window.componentLoader) {
            await window.componentLoader.insert('../components/mobile-nav.html', mobileNavContainer);
        }

        const dashSidebarContainer = document.querySelector('#dash-sidebar');
        if (dashSidebarContainer && window.componentLoader) {
            await window.componentLoader.insert('../admin/components/dash-sidebar.html', dashSidebarContainer);
        }

        setTimeout(() => {
            updateActiveNavigation();
        }, 100);

        document.title = route.title;
    } catch (error) {
        console.error('Navigation error:', error);
        if (route.path !== routes['404'].path) {
            window.location.hash = '/404';
        }
    }
}



function updateActiveNavigation() {
    const currentPath = window.location.hash.slice(1) || '/';
    
    const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    allNavLinks.forEach(link => {
        const route = link.getAttribute('data-route');
        
        if (!route) return;
        
        const isActive = route === currentPath || 
                        (currentPath === '/' && route === '/home') ||
                        (currentPath === '/feed' && route === '/home');
        
        if (isActive) {
            link.classList.add('active-nav');
            link.classList.remove('text-slate-600', 'dark:text-slate-400');
            link.classList.add('text-primary');
            
            const img = link.querySelector('img');
            if (img) {
                img.style.opacity = '1';
                img.style.transform = 'scale(1.1)';
            }
            
            const span = link.querySelector('span');
            if (span) {
                span.classList.remove('text-slate-600', 'dark:text-slate-400');
                span.classList.add('text-primary');
            }
            
            const indicator = link.querySelector('.absolute');
            if (indicator) {
                if (link.classList.contains('nav-link')) {
                    indicator.style.height = '2rem';
                } else if (link.classList.contains('mobile-nav-link')) {
                    indicator.style.width = '2rem';
                }
            }
        } else {
            link.classList.remove('active-nav', 'text-primary');
            link.classList.add('text-slate-600', 'dark:text-slate-400');
            
            const img = link.querySelector('img');
            if (img) {
                img.style.opacity = '0.7';
                img.style.transform = 'scale(1)';
            }
            
            const span = link.querySelector('span');
            if (span) {
                span.classList.remove('text-primary');
                span.classList.add('text-slate-600', 'dark:text-slate-400');
            }
            
            const indicator = link.querySelector('.absolute');
            if (indicator) {
                if (link.classList.contains('nav-link')) {
                    indicator.style.height = '0';
                } else if (link.classList.contains('mobile-nav-link')) {
                    indicator.style.width = '0';
                }
            }
        }
    });
}

window.addEventListener('hashchange', () => {
    handleLocation();
    setTimeout(updateActiveNavigation, 100);
});

window.addEventListener('load', handleLocation);
window.route = router;