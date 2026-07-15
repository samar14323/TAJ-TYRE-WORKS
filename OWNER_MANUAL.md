# Taj Tyre Works - Owner Portal Management Manual

Welcome to the **Taj Tyre Works Management System**. This guide outlines operational controls, inventory CMS rules, invoicing parameters, and financial dashboards.

---

## 1. Owner Login Credentials

To access administrative dashboards:
- Navigate to `/login` and select the **Owner** tab.
- Authenticate using one of the two seeded credentials:
  - **Samar (MHDSAM)**: Username `MHDSAM`, Password `@@MdSamar@@`
  - **Noxis (Noxis99)**: Username `Noxis99`, Password `@@Noxis001@@`
- Once logged in, the system renders a customized greeting header matching the current time of day:
  - **Morning (5 AM - 12 PM)**: `good morning samar` / `good morning noxis`
  - **Evening (5 PM - 10 PM)**: `good evening samar` / `good evening noxis`
  - **Night (10 PM - 5 AM)**: `good night samar` / `good night noxis`

---

## 2. Admin Panels & Modules

### 2.1. Morning Brief Panel
- Shows active live bay occupancy monitors (Fitting, Alignment, Balancing, Nitrogen).
- Summarizes daily workshop metrics: yesterday's net profit, gross business revenue, top brand velocity, andSUV demand projections.

### 2.2. Product Inventory CMS
- Access **Inventory** in the sidebar.
- **Add Product**: Upload image files (under 2MB, saved as base64 string directly inside PostgreSQL), select from 11 categories, input brand, model, size, purchase cost, selling price, shelf location, and warranty specs.
- **Bulk CSV actions**:
  - **Export CSV**: Downloads the complete inventory table.
  - **Import CSV**: Merges uploaded records matching by barcode or overwrites the inventory catalogue.

### 2.3. Customer Management
- Browse customer directory showing visits, total lifetime spending, outstanding balances, favorite brands, and average bills.
- Check and update customer profiles.

### 2.4. Supplier Directory
- Manage distributors, pending Purchase Orders, lead times, outstanding supplier balances, and auto-generate new POs.

### 2.5. Employee Portal & Bay Workflows
- **Staff Accounts**:
  - **Receptionist**: Username `reception`, Password `rec123`
  - **Mechanic**: Username `mechanic`, Password `mech123`
- Receptionists can register new customer queue entries and assign target mechanics.
- Mechanics can log active bay jobs, update timeline status (Arrived -> Paid -> Delivered), and log final service times.

### 2.6. Billing & GST Invoices
- Generate Job Cards using custom serials (e.g. `#TTW-2026-00001`).
- Perform checkouts calculating GST splits (28% tyres, 18% services) with Card/Cash/UPI/Credit breakdowns.
- Electronically sign invoices and print receipt copies.

### 2.7. Daily Cash Book Ledger
- Tracks cash-on-hand ledger, UPI collections, and credit payments.
- Records daily expenses (salaries, rents, tea, internet bills) to automatically compute net workshop profits.
