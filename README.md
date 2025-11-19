# Sierramar PWA


<img src="./public/images/logo_sierramar.png" title="Sierramar Logo" alt="Sierramar Logo" width="100" height="100"/>

 A Progressive Web App (PWA) as ERP for residential communities management. 



## Project Structure

This project is split into two main components:

- **Frontend (Current repository)**: PWA built with Vue.js 3 and Nuxt 3
- **Backend ([sierramar_api](https://github.com/juankypunk/sierramar_api))**: REST API built with Node.js, Express and PostgreSQL.



## Features

- **Member Fee Management**
  - Track and manage community member fees
  - Generate and process payment orders
  - Historical payment records

- **Water Management**
  - Monitor and bill water consumption
  - Separate tracking for gardens and residents
  - Usage statistics and reporting

- **Employee Management**
  - Time tracking system
  - Work schedule management
  - Attendance records

## Technology Stack

### Frontend
- Vue.js 3
- Nuxt 3
- TailwindCSS
- DaisyUI

### Backend
- Node.js
- Express
- PostgreSQL
- JWT Authentication
- RESTful API
- nodemailer


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Juan Carlos Moral - juanky@juancarlosmoral.es

## Getting Started

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev

# Build for production
npm run build
```

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.
