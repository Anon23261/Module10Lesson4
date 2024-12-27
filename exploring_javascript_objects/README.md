# Digital Library System 📚

A sophisticated JavaScript application demonstrating object-oriented programming through a modern library management system.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![JavaScript](https://img.shields.io/badge/javascript-ES6+-yellow.svg)

## 🎯 Project Overview

This project showcases modern JavaScript development practices through a library management system, focusing on object-oriented programming principles and interactive user interfaces.

## 🔑 Key Components

### 📖 Book Class (`book.js`)
```javascript
class Book {
    // Core book properties and methods
    constructor(title, author, isbn)
    checkOut()
    return()
    isAvailable()
}
```

### 📚 Library Class (`library.js`)
```javascript
class Library {
    // Library management functionality
    addBook(book)
    removeBook(isbn)
    findBook(isbn)
    listBooks()
}
```

### 🖥 UI Class (`ui.js`)
```javascript
class UI {
    // User interface handling
    displayBooks()
    addBookToList(book)
    clearFields()
    showAlert()
}
```

## ✨ Features

### 📚 Book Management
- Create and track book records
- Handle book checkouts and returns
- Manage availability status
- ISBN validation and tracking

### 🎨 User Interface
- Clean, intuitive design
- Real-time updates
- Interactive feedback
- Form validation
- Alert system

### 📊 Library Operations
- Book inventory management
- Search functionality
- Status tracking
- Error handling

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
cd exploring_javascript_objects
```

2. Open `index.html` in your browser:
```bash
# Using Python's built-in server
python -m http.server 8000
```

3. Visit `http://localhost:8000`

## 💻 Usage Examples

### Adding a Book
```javascript
const book = new Book('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565');
library.addBook(book);
ui.addBookToList(book);
```

### Finding a Book
```javascript
const book = library.findBook('9780743273565');
ui.displayBook(book);
```

### Checking Out a Book
```javascript
const book = library.findBook('9780743273565');
book.checkOut();
ui.updateBookStatus(book);
```

## 🔧 Code Structure

```
exploring_javascript_objects/
├── book.js          # Book class definition
├── library.js       # Library management logic
├── ui.js            # User interface handling
├── index.html       # Main HTML file
├── README.md        # Documentation
└── LICENSE          # MIT License
```

## 📝 Development Guidelines

### Code Style
- Use ES6+ features
- Follow OOP principles
- Maintain clear documentation
- Use meaningful variable names
- Include error handling

### Best Practices
- Validate all inputs
- Handle edge cases
- Use consistent formatting
- Write modular code
- Include comments

## 🧪 Testing

Test the application by:
1. Adding various books
2. Performing checkouts/returns
3. Testing search functionality
4. Validating error handling
5. Checking UI responsiveness

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- JavaScript ES6+ features
- OOP design patterns
- Modern web development practices

---

Made with ❤️ by [Your Name]
