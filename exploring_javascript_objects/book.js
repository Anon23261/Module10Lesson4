/**
 * @class Book
 * @description Represents a book in the library system
 */
class Book {
    /**
     * @constructor
     * @param {string} title - The title of the book
     * @param {string} author - The author of the book
     * @param {number} pages - The number of pages in the book
     */
    constructor(title, author, pages) {
        this.id = this.#generateId();
        this.title = this.#validateAndFormat(title, 'title');
        this.author = this.#validateAndFormat(author, 'author');
        this.pages = this.#validatePages(pages);
        this.dateAdded = new Date().toISOString();
        this.category = this.#categorizeBook();
        this.lastModified = this.dateAdded;
    }

    /**
     * Private method to validate and format string inputs
     * @private
     * @param {string} value - The value to validate
     * @param {string} field - The field name for error messages
     * @returns {string} - The formatted value
     * @throws {Error} - If validation fails
     */
    #validateAndFormat(value, field) {
        if (!value || typeof value !== 'string') {
            throw new Error(`Invalid ${field}: must be a non-empty string`);
        }
        return value.trim().replace(/\s+/g, ' ');
    }

    /**
     * Private method to validate page numbers
     * @private
     * @param {number} pages - The number of pages to validate
     * @returns {number} - The validated page count
     * @throws {Error} - If validation fails
     */
    #validatePages(pages) {
        const pageCount = parseInt(pages);
        if (isNaN(pageCount) || pageCount <= 0) {
            throw new Error('Pages must be a positive number');
        }
        return pageCount;
    }

    /**
     * Private method to categorize book based on page count
     * @private
     * @returns {string} - The book category
     */
    #categorizeBook() {
        if (this.pages < 100) return 'short';
        if (this.pages < 300) return 'medium';
        return 'long';
    }

    /**
     * Update book information
     * @param {Object} updates - The fields to update
     * @throws {Error} - If validation fails
     */
    update(updates) {
        const allowedUpdates = ['title', 'author', 'pages'];
        for (const [key, value] of Object.entries(updates)) {
            if (allowedUpdates.includes(key)) {
                switch (key) {
                    case 'title':
                    case 'author':
                        this[key] = this.#validateAndFormat(value, key);
                        break;
                    case 'pages':
                        this.pages = this.#validatePages(value);
                        this.category = this.#categorizeBook();
                        break;
                }
            }
        }
        this.lastModified = new Date().toISOString();
    }

    /**
     * Get book information for display
     * @returns {Object} - Formatted book information
     */
    displayInfo() {
        return {
            id: this.id,
            title: this.title,
            author: this.author,
            pages: this.pages,
            category: this.category,
            dateAdded: new Date(this.dateAdded).toLocaleDateString(),
            lastModified: new Date(this.lastModified).toLocaleDateString()
        };
    }

    /**
     * Get formatted book information with prefixes
     * @returns {Object} - Formatted book information with prefixes
     */
    getFormattedInfo() {
        const info = this.displayInfo();
        return {
            ...info,
            title: `Title: ${info.title}`,
            author: `Author: ${info.author}`,
            dateAdded: `Added: ${info.dateAdded}`,
            lastModified: `Modified: ${info.lastModified}`
        };
    }

    /**
     * Get CSS class based on book size
     * @returns {string} - CSS class name
     */
    getSizeClass() {
        return this.pages > 100 ? 'big-book' : 'small-book';
    }

    /**
     * Convert book to JSON for storage
     * @returns {Object} - JSON representation of the book
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            author: this.author,
            pages: this.pages,
            dateAdded: this.dateAdded,
            lastModified: this.lastModified,
            category: this.category
        };
    }

    /**
     * Create a Book instance from stored JSON
     * @param {Object} json - The stored book data
     * @returns {Book} - A new Book instance
     */
    static fromJSON(json) {
        const book = new Book(json.title, json.author, json.pages);
        book.id = json.id;
        book.dateAdded = json.dateAdded;
        book.lastModified = json.lastModified;
        return book;
    }

    /**
     * Generate a unique ID
     * @private
     * @returns {string} A unique identifier
     */
    #generateId() {
        return 'book_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Export the Book class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Book;
}
