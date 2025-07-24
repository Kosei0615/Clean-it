# Hotel Management App

## Overview
The Hotel Management App is designed to facilitate information transactions between front desk staff and cleaning staff in a hotel environment. It allows front desk personnel to input guest information and manage reservations, while housekeeping staff can access reservation details to ensure rooms are prepared for guests.

## Features
- Guest information management
- Room availability checking
- Reservation creation and management
- Front desk and housekeeping functionalities

## Project Structure
```
hotel-management-app
├── src
│   ├── app.ts
│   ├── models
│   │   ├── guest.ts
│   │   ├── room.ts
│   │   └── reservation.ts
│   ├── services
│   │   ├── reservationService.ts
│   │   └── roomService.ts
│   ├── controllers
│   │   ├── frontDeskController.ts
│   │   └── housekeepingController.ts
│   ├── routes
│   │   ├── frontDesk.ts
│   │   └── housekeeping.ts
│   └── types
│       └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/hotel-management-app.git
   ```
2. Navigate to the project directory:
   ```
   cd hotel-management-app
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage
1. Start the application:
   ```
   npm start
   ```
2. Access the application via your web browser at `http://localhost:3000`.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.