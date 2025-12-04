class ComponentLoader {
    async load(componentPath) {
        const res = await fetch(componentPath);
        return res.ok ? res.text() : '';
    }

    async insert(componentPath, target) {
        const html = await this.load(componentPath);
        const el = typeof target === 'string'
            ? document.querySelector(target)
            : target;

        if (el) el.innerHTML = html;
    }
}

window.componentLoader = new ComponentLoader();
