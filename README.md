AdvancedCalculator

A modern, feature-rich web-based calculator built with HTML, CSS, and JavaScript. It supports basic arithmetic, scientific calculations, unit conversions, and includes a history feature with light/dark theme support.

Features:-

Basic Calculator: Perform standard arithmetic operations (+, -, ×, ÷).
Scientific Mode: Access advanced functions like trigonometry (sin, cos, tan), logarithms, factorials, and more, displayed in a wider layout for better usability.
Unit Conversion: Convert between units for currency, area, data, speed, temperature, time, volume, and weight.
History Tracking: View and reuse previous calculations or conversions.
Theme Toggle: Switch between light and dark themes, with preferences saved via localStorage.
Responsive Design: Optimized for both desktop and mobile devices.
Keyboard Support: Use keyboard inputs for quick calculations.
Memory Functions: Store, recall, and clear values in memory slots.

Demo
Try the calculator live: [Insert live demo link here, e.g., GitHub Pages]
Installation

Clone the Repository:
git clone https://github.com/UgeshKumarReddyS/AdvancedCalculator.git


Navigate to the Project Directory:
cd AdvancedCalculator


Open the Application:

Open index.html in a web browser (e.g., Chrome, Firefox).

Alternatively, serve the project using a local server:
npx http-server

Then visit http://localhost:8080.




Dependencies

Math.js (included via CDN for advanced mathematical computations)

Usage

Basic Mode: Use the number and operator buttons for standard calculations.
Scientific Mode: Toggle the scientific mode (🧮 button) to display additional functions in a wider layout.
Conversion Mode: Switch to conversion mode (↔ button) to convert units.
Theme Toggle: Click the moon/sun icon (🌙) to switch between light and dark themes.
History: View past calculations/conversions in the history panel; click an entry to reuse it.
Keyboard Input: Use number keys, operators (+, -, *, /), and specific keys (e.g., 's' for sin, 'p' for π) for quick input.

Project Structure
AdvancedCalculator/
├── index.html    # Main HTML file containing the structure
├── style.css     # CSS styles for layout, theming, and responsiveness
├── script.js     # JavaScript logic for calculator functionality
└── README.md     # Project documentation

Design Decisions

Separated CSS and JavaScript:
Reasoning: Splitting the CSS into style.css and JavaScript into script.js improves code maintainability and readability. It separates concerns, making it easier to update styles or logic independently and facilitating collaboration among developers.


External Math.js Library:
Reasoning: Math.js is used via CDN to handle complex mathematical computations (e.g., trigonometry, factorials, logarithms) reliably and efficiently. Using a CDN reduces the need to maintain custom math logic, ensures access to a well-tested library, and minimizes the project’s file size.



Contributing
Contributions are welcome! To contribute:

Fork the repository.
Create a new branch (git checkout -b feature/your-feature).
Make your changes and commit (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a Pull Request.

Please ensure your code follows the existing style, includes appropriate comments, and respects the separation of concerns (HTML for structure, CSS for styling, JavaScript for logic).
Syncing with Remote
Before pushing changes, ensure your local branch is up-to-date:
git pull origin main

Resolve any merge conflicts by editing the affected files and committing the changes. Use branches for new features to avoid conflicts on main.
License
This project is licensed under the MIT License.
Acknowledgments

Built with Math.js for robust mathematical computations.
Inspired by modern calculator apps with a focus on usability and aesthetics.

Contact
For questions or suggestions, open an issue or reach out to ugesh9440@gmail.com.
