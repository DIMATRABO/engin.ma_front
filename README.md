# 🚜 engin.ma – JCB Rental Platform

**engin.ma** is a modern web platform that connects clients looking to rent construction machinery (like JCBs) with machine owners. Admins manage and monitor the platform. Inspired by [booking.com](https://booking.com), the goal is to offer a fast, responsive, and multilingual user experience.

---

## 📦 Tech Stack

| Layer       | Tech                              |
|-------------|-----------------------------------|
| Frontend    | Next.js (App Router, TypeScript)  |
| Styling     | Tailwind CSS                      |
| UI Fonts    | Geist (Sans & Mono)               |
| Map         | React Leaflet                     |
| Forms       | React Hook Form                   |
| i18n        | next-intl                         |
| Auth        | JWT Token (from backend)          |
| Hosting     | Vercel (Frontend) / Render (Backend) |
| Backend     | FastAPI (Python)                  |
| Database    | PostgreSQL                        |

---

## 🌍 Multilingual Support

- Full support for RTL (Arabic) and LTR (French/English)
- Language switcher and layout orientation adapted

---

## 🔐 Roles

### 👷 Owner
- List and manage machines
- Accept or reject booking requests
- Manage profile and calendar

### 🧑‍💼 Client
- Explore and filter machines
- Book or request rentals
- Write reviews post-booking
- Manage own profile

### 🛠 Admin
- Dashboard for global overview
- Manage users and machines
- Review and moderate content

---

## 📂 Frontend Folder Structure

```
/app
  /[locale]
    /page.tsx                         ← Public homepage

    /auth
      login/page.tsx
      register/page.tsx

    /machines
      page.tsx                        ← Public machine listing
      [id]/page.tsx                   ← Machine details (with reviews, map)

    /add-machine/page.tsx            ← Only for owners

    /client
      layout.tsx
      dashboard/page.tsx
      profile/page.tsx
      orders/page.tsx

    /owner
      layout.tsx
      dashboard/page.tsx
      profile/page.tsx
      my-machines/page.tsx
      bookings/page.tsx

    /admin
      layout.tsx
      dashboard/page.tsx
      users/page.tsx
      machines/page.tsx

    layout.tsx
    not-found.tsx
```

---

## 📄 Interfaces & Use Cases

| Page                           | Description |
|--------------------------------|-------------|
| `/`                            | Landing page with filters (type, city, dates) |
| `/machines`                   | Machine listing (with filter by category) |
| `/machines/[id]`             | Machine detail view: photos, map, owner info, reviews |
| `/auth/login`                | Login form (client, owner) |
| `/auth/register`             | Registration forms (based on role clicked) |
| `/add-machine`               | Add machine form for owners |
| `/client/dashboard`          | Summary view of client activity |
| `/client/profile`            | Update personal info |
| `/client/orders`             | View bookings history |
| `/owner/dashboard`           | Summary for owner |
| `/owner/profile`             | Update owner info |
| `/owner/my-machines`         | List and manage owned machines |
| `/owner/bookings`            | View bookings per machine |
| `/admin/dashboard`           | Admin insights |
| `/admin/users`               | Manage user list |
| `/admin/machines`            | Validate/manage machines |

---

## 🌟 Features

- 🔍 Filter by category, city, and date
- 🌐 Multilanguage + layout direction
- 🧾 Booking system (via backend)
- 📷 Machine detail with photos and map
- 📝 Review system (clients review machine, driver, owner after booking)
- 📱 Mobile responsive (with future APK possibility)
- 🛠 Admin moderation tools

---

## 📚 Inspiration

- [btp360.ma](https://btp360.ma) – structure and categories
- [booking.com](https://booking.com) – style, UX reference
- [Leaflet Map](https://leafletjs.com)

---

## 🚀 Development Guidelines

- Reusable components
- Centralized styles
- Keep code modular and easy to test
- Respect file-based routing and role separation
- Translate all content via `next-intl`
- Use layouts per role

---

## ✨ Coming Next

- Calendar availability
- Booking calendar sync
- Future payment integration
- Notifications system

---