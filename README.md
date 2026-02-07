# Valentine-Day-Invitie

A modern, interactive Valentine's Day invitation platform that lets you create personalized love stories and share them with someone special.

This project allows users to create accounts, upload photos of themselves and their partner, generate personalized invite links, and share beautiful combined photo reveals with custom gradient overlays.

## Features

- **Multi-Step Signup**: Collect creator and receiver info, partner name, and photos (him/her) with recovery photos for account recovery.
- **Personalized Invites**: Generate shareable invite links with query parameters for receiver verification.
- **Full-Screen Photo Overlay**: Display merged couple photos on a gradient background with low opacity.
- **Account Recovery**: Show stored recovery photos during password reset for verification.
- **Admin Dashboard**: Manage users, view statistics, edit/delete accounts, and search functionality.
- **Role-Based Access**: Separate admin and user authentication flows.
- **localStorage Persistence**: All data stored as Base64-encoded images in browser storage.

## How It Works

- The user is greeted with a cute GIF and the question "Will you be my Valentine?".
- Responding "No" changes the GIF and modifies the size and text of the buttons, adding a playful element to convince the user to reconsider.
- A "Yes" click celebrates the moment with a special GIF and triggers a confetti animation, hiding the response buttons.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/BHAVIADWANI/BHAVIADWANI.github.io
   ```
2. Navigate to the project directory:
   ```bash
   cd BHAVIADWANI.github.io
   ```
3. Open `index.html` in your browser to view the homepage.

No additional setup is required, as Tailwind CSS is included via CDN and JavaScript is embedded within the HTML.

## Technologies Used

- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript (no build tools required)
- FileReader API for image handling
- Canvas API for image merging
- localStorage for data persistence
- Base64 encoding for image storage

## Contributions

Feel the love? Contributions are welcome! Whether it's a new GIF suggestion, design improvements, or code optimisation, feel free to fork the repository and submit a pull request.

## License

This project is open source and available under [MIT License](LICENSE).

Happy Valentine's Day! Let's spread the love ❤️.
