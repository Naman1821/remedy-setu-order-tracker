# Remedy Setu – Order Tracking Tool

My submission for the **Software Development Intern (Full Stack)** assignment.
**Option chosen: Option 5 – Order Tracking Tool**

**Live demo:** https://naman1821.github.io/remedy-setu-order-tracker/

An internal tool to track an order from enquiry to delivery:

**Query → Procurement → Invoiced → Dispatched → Delivered**

## Features (done)

- Add a new order with customer name, phone, city, items, amount, courier tracking ID and stage
- Dashboard showing the number of orders in each stage, plus total orders and total order value
- Click a stage on the dashboard to see only the orders in that stage
- Move an order to the next stage with one click
- A courier tracking ID is required before an order can be marked Dispatched / Delivered
- Edit and delete orders
- Search by order ID, name, phone, city or tracking ID
- Orders are saved in the browser (localStorage), so they stay after a page refresh
- Starts with 5 sample orders; "Reset sample data" (in the footer) brings them back
- Mobile-friendly layout

## Tech Stack

- HTML, CSS, JavaScript (no framework, no build step)
- Browser localStorage to store orders
- Hosted on GitHub Pages

## Run Locally (under 1 minute)

1. Clone or download this repository (Code → Download ZIP) and unzip it
2. Open `index.html` in Chrome or any other browser

That's it, nothing to install.

## Project Structure

```
index.html   → page layout (dashboard, order form, order list)
style.css    → styling (mobile first, two columns on bigger screens)
app.js       → all the logic: saving/loading orders, form, stage changes, search, dashboard
```

## Data Model

Each order is a JavaScript object. All orders are kept in one array, which is saved in localStorage as JSON (key: `remedySetuOrders`).

| Field      | Example                                                           |
|------------|-------------------------------------------------------------------|
| id         | `ORD-1006`                                                        |
| customer   | `Shri Ganesh Jyotish`                                             |
| phone      | `9876501234`                                                      |
| city       | `Indore`                                                          |
| items      | `Rudraksha 5 Mukhi x 50`                                          |
| amount     | `7500`                                                            |
| trackingId | `DTDC12345678`                                                    |
| stage      | `Query` / `Procurement` / `Invoiced` / `Dispatched` / `Delivered` |
| createdAt  | `2026-11-17T13:05:00.000Z`                                        |

## Bonus Items

- PDF invoice: not attempted

## Limitations

- Data is saved only in the browser where it was entered, so it is not shared between team members or devices
- No login (kept simple as an internal tool for now)

## What I'd Add Next

1. A backend and database (e.g. Node.js + PostgreSQL or Supabase) so the whole team sees the same orders
2. Login for the team
3. PDF invoice generation (the bonus item)
4. WhatsApp / SMS update to the customer when an order is dispatched
5. Stage history (who moved the order and when)
