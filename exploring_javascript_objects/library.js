/**
 * @class Library
 * @description Manages the collection of books and provides methods for manipulation and retrieval
 */
class Library {
    /**
     * @constructor
     * Creates a new Library instance and loads existing books from storage
     */
    constructor() {
        this.books = [];
        this.eventListeners = new Map();
        this.loadBooks();
    }

    /**
     * Load books from localStorage
     * @private
     */
    loadBooks() {
        try {
            const savedBooks = localStorage.getItem('libraryBooks');
            if (savedBooks) {
                const bookData = JSON.parse(savedBooks);
                this.books = bookData.map(book => Book.fromJSON(book));
            } else {
                // Add sample books if no saved books exist
                this.#addSampleBooks();
            }
            this.#emit('booksLoaded', this.books);
        } catch (error) {
            console.error('Error loading books:', error);
            this.#addSampleBooks();
        }
    }

    /**
     * Add sample books to the library
     * @private
     */
    #addSampleBooks() {
        const sampleBooks = [
            { title: "The Great Gatsby", author: "F. Scott Fitzgerald", pages: 180 },
            { title: "Animal Farm", author: "George Orwell", pages: 112 },
            { title: "The Little Prince", author: "Antoine de Saint-Exupéry", pages: 96 },
            { title: "1984", author: "George Orwell", pages: 328 },
            { title: "To Kill a Mockingbird", author: "Harper Lee", pages: 281 }
        ];

        sampleBooks.forEach(book => {
            this.addBook(book.title, book.author, book.pages);
        });
    }

    /**
     * Save books to localStorage
     * @private
     */
    #saveBooks() {
        try {
            localStorage.setItem('libraryBooks', JSON.stringify(this.books));
            this.#emit('booksSaved', this.books);
        } catch (error) {
            console.error('Error saving books:', error);
            this.#emit('error', 'Failed to save books');
        }
    }

    /**
     * Add a new book to the library
     * @param {string} title - The book title
     * @param {string} author - The book author
     * @param {number} pages - The number of pages
     * @returns {Book} The newly created book
     * @throws {Error} If validation fails
     */
    addBook(title, author, pages) {
        try {
            const book = new Book(title, author, pages);
            this.books.push(book);
            this.#saveBooks();
            this.#emit('bookAdded', book);
            return book;
        } catch (error) {
            this.#emit('error', error.message);
            throw error;
        }
    }

    /**
     * Remove a book from the library
     * @param {string} bookId - The ID of the book to remove
     * @returns {boolean} True if book was removed, false otherwise
     */
    removeBook(bookId) {
        const initialLength = this.books.length;
        this.books = this.books.filter(book => book.id !== bookId);
        
        if (this.books.length !== initialLength) {
            this.#saveBooks();
            this.#emit('bookRemoved', bookId);
            return true;
        }
        return false;
    }

    /**
     * Update a book's information
     * @param {string} bookId - The ID of the book to update
     * @param {Object} updates - The fields to update
     * @returns {Book|null} The updated book or null if not found
     */
    updateBook(bookId, updates) {
        const book = this.books.find(book => book.id === bookId);
        if (book) {
            try {
                book.update(updates);
                this.#saveBooks();
                this.#emit('bookUpdated', book);
                return book;
            } catch (error) {
                this.#emit('error', error.message);
                throw error;
            }
        }
        return null;
    }

    /**
     * Search books by title
     * @param {string} title - The title to search for
     * @returns {Array<Book>} Array of matching books
     */
    searchByTitle(title) {
        return this.books.filter(book => 
            book.title.toLowerCase().includes(title.toLowerCase())
        );
    }

    /**
     * Search books by author
     * @param {string} author - The author to search for
     * @returns {Array<Book>} Array of matching books
     */
    searchByAuthor(author) {
        return this.books.filter(book => 
            book.author.toLowerCase().includes(author.toLowerCase())
        );
    }

    /**
     * Get books by category
     * @param {string} category - The category to filter by
     * @returns {Array<Book>} Array of books in the category
     */
    getBooksByCategory(category) {
        return this.books.filter(book => book.category === category);
    }

    /**
     * Get all books with more than 100 pages
     * @returns {Array<Book>} Array of books with more than 100 pages
     */
    getBigBooks() {
        return this.books.filter(book => book.pages > 100);
    }

    /**
     * Get all books with formatted information
     * @returns {Array<Object>} Array of formatted book information
     */
    getFormattedBooks() {
        return this.books.map(book => book.getFormattedInfo());
    }

    /**
     * Get all books
     * @returns {Array<Book>} Array of all books
     */
    getAllBooks() {
        return this.books;
    }

    /**
     * Sort books by various criteria
     * @param {string} criteria - The sorting criteria
     * @returns {Array<Book>} Sorted array of books
     */
    sortBooks(criteria) {
        const sorters = {
            title: (a, b) => a.title.localeCompare(b.title),
            author: (a, b) => a.author.localeCompare(b.author),
            pages: (a, b) => a.pages - b.pages,
            date: (a, b) => new Date(b.dateAdded) - new Date(a.dateAdded),
            category: (a, b) => a.category.localeCompare(b.category)
        };

        const sorter = sorters[criteria] || sorters.title;
        return [...this.books].sort(sorter);
    }

    /**
     * Get statistics about the library
     * @returns {Object} Library statistics
     */
    getStatistics() {
        return {
            totalBooks: this.books.length,
            averagePages: Math.round(
                this.books.reduce((sum, book) => sum + book.pages, 0) / this.books.length
            ),
            categories: {
                short: this.getBooksByCategory('short').length,
                medium: this.getBooksByCategory('medium').length,
                long: this.getBooksByCategory('long').length
            },
            authors: [...new Set(this.books.map(book => book.author))].length
        };
    }

    /**
     * Add an event listener
     * @param {string} event - The event name
     * @param {Function} callback - The callback function
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event).add(callback);
    }

    /**
     * Remove an event listener
     * @param {string} event - The event name
     * @param {Function} callback - The callback function
     */
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).delete(callback);
        }
    }

    /**
     * Emit an event
     * @private
     * @param {string} event - The event name
     * @param {*} data - The event data
     */
    #emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} event handler:`, error);
                }
            });
        }
    }
}

// Export the Library class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Library;
}
