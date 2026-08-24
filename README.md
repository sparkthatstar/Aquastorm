# AquaStorm

AquaStorm is a real-time water delivery and order management platform designed to connect customers, delivery vendors, managers, and business owners through a simple, mobile-first web application.

The platform supports customer ordering, vendor delivery management, payment verification, inventory tracking, real-time customer/vendor communication, Aqua Points rewards, vendor cash-outs, notifications, analytics, fraud detection, and administrative oversight.

## Project Overview

AquaStorm is built around four primary user roles:

- Customer
- Vendor
- Manager
- Owner

Each role has different permissions enforced at the database level using Supabase Row Level Security (RLS).

The application is designed to be:

- Extremely simple and easy to use
- Attractive and memorable
- Mobile-first
- Fast
- Real-time
- Secure
- Configurable
- Scalable
- Suitable for real-world business operations

## Architecture

```text
Customer / Vendor / Manager / Owner
                |
                v
       Next.js / React / TypeScript
                |
                v
              Vercel
                |
                v
             Supabase
        /       |       \
      Auth   PostgreSQL   Storage
                |
             Realtime
