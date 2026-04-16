# AKEvent

AKEvent is a comprehensive event management platform designed to help users create, manage, and organize events seamlessly. Students can get live event information and discuss among each other, ensuring an interactive discussion experience. The platform features event enrollment, notifications, and a user-friendly interface for both organizers and attendees.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- **Event Creation & Management:** Easily create, update, and delete events with image uploads
- **User Registration & Authentication:** Secure sign-up/login for event attendees and organizers
- **Event Enrollment:** Students can enroll/unenroll in events with one click
- **Notification System:** Real-time notifications for upcoming events and enrollments
- **Interactive Discussions:** Comment and like functionality for event engagement
- **Role-based Dashboards:** Separate dashboards for organizers and students
- **Cloudinary Integration:** Image uploads for event thumbnails and profile photos
- **Responsive Design:** Fully responsive across all devices

## Technologies Used

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js with Express
- **Database:** MongoDB with Mongoose
- **Cloud Storage:** Cloudinary for image uploads
- **Development Tools:** Postman, VS Code

## Installation

Follow these steps to set up the project locally:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/mrakmondal6612/EventManageApp.git
   ```

2. **Navigate to the Project Directory**
   ```bash
   cd eventmgt
   ```

3. **Install Backend Dependencies**
   ```bash
   cd eventmgtbackend
   npm install
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd ../eventApp
   npm install
   ```

5. **Setup the Database**

   - Connect to MongoDB database locally or use MongoDB Atlas connection string

6. **Configure Environment Variables**

   - Create a `.env` file in `eventmgtbackend` directory and add the necessary environment variables:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     ```

## Configuration

- **Server Settings:** Adjust server configuration in `eventmgtbackend/server.js`
- **Database Connection:** Ensure the database credentials in your `.env` file match your setup
- **Frontend Configuration:** Set API base URL in `eventApp/.env` file (defaults to deployed backend: https://eventmgtbackend.onrender.com)

## Usage

### Deployed Application

- **Backend:** https://eventmgtbackend.onrender.com
- **Frontend:** https://event-app-bay-tau.vercel.app

### Running Locally

1. **Start Backend Server**
   ```bash
   cd eventmgtbackend
   npm run dev
   ```

2. **Start Frontend Server** (in a new terminal)
   ```bash
   cd eventApp
   npm run dev
   ```

3. **Accessing the Application**

   Open your web browser and navigate to the frontend URL (typically `http://localhost:5173`) to start using the application.

### Environment Configuration

The frontend is configured to use the deployed backend by default. To use the local backend:

- Edit `eventApp/.env` and set `VITE_API_BASE_URL=http://localhost:8000`

## Features Overview

**Create Events**

Organizers can create events with detailed information including title, description, date, time, location, and event thumbnail images.

**Organizer Dashboard**

Organizers can manage their events, view statistics, track enrollments, and monitor user engagement.

**Student Dashboard**

Students can browse events, enroll in events, like and comment on events, and receive notifications about upcoming events.

**Event Enrollment**

Users can easily enroll or unenroll from events with a single click, with real-time enrollment counts displayed.

**Comments Section**

Users can discuss events in the comment section, fostering community engagement and interaction.

**Notifications**

Users receive notifications for upcoming events and when users enroll in their events.

## Contributing

Contributions are welcome! If you have suggestions for improvements or want to add new features:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to your branch (`git push origin feature/YourFeature`).
5. Open a pull request.

For major changes, please open an issue first to discuss what you would like to change.

## License

Distributed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Contact

For any questions or suggestions, please open an issue or contact the project maintainer.

Project Repository: [EventManageApp on GitHub](https://github.com/mrakmondal6612/EventManageApp)

