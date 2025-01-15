class SearchIndex {
    constructor() {
        this.index = [];
    }

    addPost(post) {
        this.index.push({
            title: post.title,
            content: this.stripHtml(post.content),
            tags: post.tags,
            categories: post.categories,
            slug: post.slug,
            date: post.date
        });
    }

    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '');
    }

    search(query) {
        query = query.toLowerCase();
        return this.index.filter(post => {
            return post.title.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.toLowerCase().includes(query)) ||
                (post.categories || []).some(cat => cat.toLowerCase().includes(query));
        });
    }

    toJSON() {
        return this.index;
    }
}

module.exports = SearchIndex;
