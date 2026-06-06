# 🍔 Cariburger SaaS - Production System Spec (v2)

## 🎯 Overview
Cariburger is a location-based burger discovery platform where users can explore burger shops on a live map, filter by distance, and see real-time shop status (open/closed). Owners manage shops, while admin controls approval.

---

## 👥 User Roles

### 🛠 Admin (Platform Owner)
- Approve/reject shops
- Approve/reject burger listings
- Manage users and content
- View analytics dashboard
- Moderate comments

### 🧑‍🍳 Shop Owner
- Register and login (Google login optional future)
- Create shop profile
- Add burger menu items
- Set opening hours
- Submit for admin approval

### 👀 Public Users
- Google login only authentication
- Browse burger shops on map
- Filter by distance & location
- View shop details
- Add comments & reviews

---

## 🔐 Authentication System

### Public Users
- ONLY Google OAuth login
- No email/password registration
- Required for commenting and saving favorites

### Shop Owners
- Google login or manual signup (configurable)
- Must be verified before shop activation

---

## 🗺 Core Feature: Map-Based Discovery (MAIN FEATURE)

### Map System
- Interactive map (Google Maps / Mapbox)
- Display all approved burger shops as markers
- Cluster markers for dense areas

### Filters
- Distance slider (e.g. 1km – 50km)
- Location-based search (GPS or manual pin)
- Open now filter
- Price range filter (future)

### Shop Marker Status
Each shop marker shows:
- 🟢 Open
- 🔴 Closed
- 🟡 Closing soon (optional future logic)

Based on:
- Opening hours
- Current server time
- Timezone handling

### Map Interactions
- Click marker → shop preview card
- Open shop detail page
- Navigate via Google Maps link

---

## 🔄 Core Workflow

1. Owner registers & creates shop
2. Shop status = `pending`
3. Admin approves shop
4. Shop appears on map
5. Users browse via map + filters
6. Users log in via Google
7. Users post comments & reviews

---

## 🗄 Database Structure

### users
- id
- name
- email
- google_id
- role (admin | owner | user)

### shops
- id
- user_id
- name
- description
- address
- lat
- lng
- opening_hours (JSON)
- status (pending | approved | rejected)
- created_at

### burgers
- id
- shop_id
- name
- description
- price
- image
- created_at

### comments
- id
- user_id
- shop_id
- message
- rating (optional)
- created_at

---

## 🧠 Business Logic Rules

- Only approved shops appear on map
- Shop visibility depends on status
- Open/Closed computed dynamically
- Only Google-auth users can comment
- Admin moderates reported comments

---

## 🖥️ System Modules

### 🌍 Public Map Interface (CORE)
- Fullscreen map
- Search bar
- Distance filter slider
- Open/closed indicators
- Shop preview cards

### 🏪 Shop Page
- Menu list
- Photos
- Opening hours
- Comments section
- Google Maps navigation button

### 🧑‍🍳 Owner Dashboard
- Create/edit shop
- Manage burgers
- Set opening hours
- View approval status

### 🛠 Admin Dashboard
- Approve shops
- Manage users
- Moderate comments
- View analytics

---

## 🔐 Security & Access Control

- Google OAuth required for public interaction
- Role-based middleware
- Rate limiting on comments
- Spam protection for reviews

---

## 📸 Media Handling

- Shop images
- Burger images
- Stored in S3 or local storage
- Image compression required

---

## 🚀 Future Enhancements

- Real-time busy level (live crowd indicator)
- Paid featured pins on map
- AI burger recommendations
- Delivery integration
- Loyalty points system

---

## 📌 Vision

Turn Cariburger into a **map-first food discovery platform for Malaysia**, starting with burgers, focusing on real-world location interaction, social discovery, and trust-based listings.
