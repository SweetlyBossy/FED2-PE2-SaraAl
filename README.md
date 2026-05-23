#  Nordic Stay
Nordic Stay is a modern, responsive accommodation platform designed to connect travelers with authentic Norwegian experiences. Developed as the final Project Exam 2 (PE2) for Noroff, this application delivers a clean, user-centric interface for guests seeking their next getaway, alongside a powerful, intuitive dashboard for venue managers overseeing their properties.

**[[View Live Site Here](https://fed2-pe2-saraal.netlify.app/)]** • **[[View Figma Design Here](https://www.figma.com/design/1FMOVWI8HWPmR07gzMBiq0/Untitled?node-id=0-1&t=DQbGGjvxpCJREbG8-1)]** • **[[Kanban Board Here](https://github.com/users/SweetlyBossy/projects/5)]**

---
##  Table of Contents
1. [Features](#-features)
2. [Built With](#-built-with)
3. [Getting Started](#-getting-started)
4. [Environment Variables](#-environment-variables)
5. [Testing & Validation](#-testing--validation)
6. [Author](#-author)
---

##  Features
The application is fully integrated with the official Noroff Holidaze API v2 and satisfies all core user stories:
### For All Users (Unregistered & Registered)
* **Explore & Discover:** Browse a comprehensive list of available venues, search by specific locations, and filter by price, guest capacity, and amenities.
* **Detailed Listings:** Access comprehensive venue pages featuring image galleries, host details, and a dynamic availability calendar that visually blocks out booked dates.
* **Secure Registration:** Safe and seamless account creation for both Customers and Venue Managers (requires a valid `@stud.noroff.no` email address).

### For Registered Travelers (Customers)
* **Streamlined Booking:** Select check-in and check-out dates to securely reserve your next holiday destination.
* **Profile Customization:** Easily update personal bios and avatar images to personalize the platform experience.
* **Trip Management:** Access a dedicated dashboard to track upcoming adventures, review past stays, and modify or cancel active reservations.

### For Venue Managers (Hosts)
* **Property Command Center:** Access a secure, dedicated dashboard to monitor overall hosting performance, total active venues, and incoming guest requests.
* **Listing Control:** Publish, edit, and permanently delete venue listings. Includes support for dynamic image arrays, pricing adjustments, and specific amenity toggles (WiFi, Parking, Breakfast, Pets).
* **Reservation Moderation:** Review guest bookings and safely decline/cancel reservations directly from the dashboard with instant UI updates.
---

##  Built With
This project was engineered using a modern React tech stack. The UI was designed with a strict, minimalist Nordic aesthetic (featuring crisp whites, slate tones, and vibrant teal accents) to ensure a premium, accessible user experience.
* **[React 18](https://reactjs.org/)** - Core UI Library
* **[TypeScript](https://www.typescriptlang.org/)** - Static Type Safety & Interfaces
* **[Vite](https://vitejs.dev/)** - Lightning-fast Build Tool & Bundler
* **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling and responsive layouts
* **[React Router v6](https://reactrouter.com/)** - Client-side routing and secure page navigation
* **[Noroff API v2](https://docs.noroff.dev/docs/v2/holidaze)** - Backend Database & Authentication
---

##  Getting Started
To get a local copy of Nordic Stay up and running, follow these steps.

### Prerequisites
You will need Node.js and npm installed on your machine.
- npm install npm@latest -g
Installation

Clone the repository:
- git clone [https://github.com/SweetlyBossy/FED2-PE2-SaraAl.git]

Navigate into the directory:
Install NPM packages:
- npm install

Start the development server:
- npm run dev
* Open your browser and visit http://localhost:5173

### Environment Variables
To run this project locally, you must create a .env file in the root directory and add the following variables. Note: You must generate your own API key via the Noroff API portal.

- VITE_API_BASE_URL="[https://v2.api.noroff.dev]
- VITE_API_KEY="47d984a7-a889-4088-ab5f-c3b321e439d9"
* This is implemented into Netlify. Added here for local use also, due to grading. 

Testing & Validation
This project has been rigorously tested against the PE2 user stories and validated using industry-standard tools to ensure maximum performance and accessibility:
- Lighthouse: Validated for Performance, Accessibility, Best Practices, and SEO optimization.
- WAVE (Web Accessibility Evaluation Tool): Tested to ensure proper contrast ratios, ARIA labeling, and semantic HTML structure.
- W3C HTML Validator: Verified to ensure clean, error-free DOM rendering.

### Author
**Sara Al** • **GitHub:** [@SweetlyBossy](https://github.com/SweetlyBossy)
*Noroff Project Exam 2 - Front-End Development*