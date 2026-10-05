# Security Specification - Burguer Power Firestore ABAC & RLS

## 1. Data Invariants
- **Users Invariant**: A user profile document `/users/{userId}` can only be read, created, or updated by the authenticated owner where `request.auth.uid == userId`.
- **Order Identity Invariant**: An order document `/orders/{orderId}` must have `userId == request.auth.uid` upon creation. A user cannot place orders on behalf of someone else.
- **Order Listing Invariant**: Users can only query and list orders where `resource.data.userId == request.auth.uid`. No blanket order listing.
- **Order Status Invariant**: Users can cancel their own orders only if the status is currently `'recebido'` or `'em_preparo'`, transitioning only to `'cancelado'`. Once `'concluido'` or `'cancelado'`, it is immutable.
- **Products Invariant**: Products in `/products/{productId}` are read-only for public/authenticated users. Writes are restricted to admin users (`xboxbrstream@gmail.com`).
- **Volumetric Boundaries**: ID strings must be `<= 128` chars matching `^[a-zA-Z0-9_\-]+$`. Strings like address, notes, and names must enforce length boundaries.

## 2. The Dirty Dozen Payloads (Designed to break Identity, Integrity, and State)
1. **Payload 1 (Identity Spoofing - Order)**: Creating an order with `userId: "victim_123"` while authenticated as `attacker_456`.
2. **Payload 2 (Ghost Field Injection)**: Inserting `isAdmin: true` or `discountCode: "100_PERCENT_FREE"` into an order or user document.
3. **Payload 3 (Denial of Wallet - ID Overflow)**: Attempting to create an order with a 2MB document ID string.
4. **Payload 4 (Terminal State Bypass)**: Attempting to update an order with status `'cancelado'` back to `'recebido'` or `'concluido'`.
5. **Payload 5 (Cross-Tenant Order Reading)**: Attempting to `get` an order belonging to another user without permission.
6. **Payload 6 (Unauthenticated Order Write)**: Attempting to create an order without an active auth token.
7. **Payload 7 (PII Scraping via Blanket List)**: Attempting to list all users from `/users` collection without filtering by `request.auth.uid`.
8. **Payload 8 (Product Price Manipulation)**: Attempting to create or update a product document in `/products` as a regular non-admin customer.
9. **Payload 9 (Order Price Tampering)**: Attempting to update `total` or `items` on an order that has already been dispatched.
10. **Payload 10 (Malformed Data Injection)**: Injecting negative `total` or `subtotal` or `total: "free"` non-number.
11. **Payload 11 (Unverified Email Write)**: Attempting to perform administrative updates with an unverified email token.
12. **Payload 12 (Orphaned Order Mutation)**: Attempting to delete an active order while in delivery phase.

## 3. Test Runner Invariant Checks
All 12 malicious payloads must return `PERMISSION_DENIED` under the rules defined in `firestore.rules`.
