/**
 * @class UI
 * @description Handles all UI interactions and updates for the library system
 */
class UI {
    constructor() {
        // Initialize library
        this.library = new Library();
        
        // Initialize UI elements
        this.initializeElements();
        this.setupEventListeners();
        
        // Initial display
        this.refreshBookList();
    }

    initializeElements() {
        // Forms
        this.bookForm = document.getElementById('addBookForm');
        this.titleInput = document.getElementById('title');
        this.authorInput = document.getElementById('author');
        this.pagesInput = document.getElementById('pages');
        
        // Search and filter elements
        this.searchInput = document.getElementById('searchInput');
        this.searchType = document.getElementById('searchType');
        this.sortSelect = document.getElementById('sortSelect');
        this.showAllBooksBtn = document.getElementById('showAllBooks');
        this.showBigBooksBtn = document.getElementById('showBigBooks');
        this.showFormattedViewBtn = document.getElementById('showFormattedView');
        
        // Display elements
        this.bookList = document.getElementById('booksList');
    }

    setupEventListeners() {
        // Form submission
        this.bookForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Search and filter
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.searchType.addEventListener('change', () => this.handleSearch());
        this.sortSelect.addEventListener('change', () => this.handleSort());
        
        // Filter buttons
        this.showAllBooksBtn.addEventListener('click', () => this.showAllBooks());
        this.showBigBooksBtn.addEventListener('click', () => this.showBigBooks());
        this.showFormattedViewBtn.addEventListener('click', () => this.showFormattedView());
    }

    handleFormSubmit(e) {
        e.preventDefault();
        try {
            const book = new Book(
                this.titleInput.value,
                this.authorInput.value,
                parseInt(this.pagesInput.value)
            );
            this.library.addBook(book);
            this.bookForm.reset();
            this.refreshBookList();
        } catch (error) {
            alert(error.message);
        }
    }

    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const searchBy = this.searchType.value;
        
        const books = this.library.getAllBooks().filter(book => {
            return book[searchBy].toLowerCase().includes(searchTerm);
        });
        
        this.displayBooks(books);
    }

    handleSort() {
        const sortBy = this.sortSelect.value;
        if (!sortBy) return;
        
        const books = this.library.getAllBooks().sort((a, b) => {
            if (sortBy === 'pages') {
                return a[sortBy] - b[sortBy];
            } else if (sortBy === 'date') {
                return new Date(b.dateAdded) - new Date(a.dateAdded);
            }
            return a[sortBy].localeCompare(b[sortBy]);
        });
        
        this.displayBooks(books);
    }

    showAllBooks() {
        this.displayBooks(this.library.getAllBooks());
    }

    showBigBooks() {
        this.displayBooks(this.library.getBigBooks());
    }

    showFormattedView() {
        const books = this.library.getAllBooks();
        this.displayBooks(books, true);
    }

    displayBooks(books, formatted = false) {
        if (books.length === 0) {
            this.bookList.innerHTML = `
                <div class="no-books">
                    <i class="fas fa-book"></i>
                    <p>No books found</p>
                </div>`;
            return;
        }

        const booksHTML = books.map(book => {
            const cardClass = formatted ? 'book-card formatted' : 'book-card';
            return `
                <div class="${cardClass}">
                    <h3>${book.title}</h3>
                    <p><i class="fas fa-user"></i> ${book.author}</p>
                    <p><i class="fas fa-file-alt"></i> ${book.pages} pages</p>
                    <p class="date-added">
                        <i class="fas fa-calendar"></i> 
                        ${new Date(book.dateAdded).toLocaleDateString()}
                    </p>
                </div>`;
        }).join('');

        this.bookList.innerHTML = booksHTML;
    }

    refreshBookList() {
        this.displayBooks(this.library.getAllBooks());
    }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ui = new UI();
});
