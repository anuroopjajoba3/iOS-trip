# Trip wallet

Sign up. Register your card. Start a trip. Put your card and up to five friends' cards under one trip card.

Merchants charge that one trip card for the full amount. Under it, every person's credit or debit card is charged an equal share. Nobody fronts the trip and waits to be paid back. If anyone cannot cover their share, the whole cart is declined.

## Use

1. Sign up or log in.
2. Add your real debit or credit card (last four, limit). The app issues a virtual trip card when you start a trip.
3. Start a trip: a name, then friends with the **+**. Each friend brings their own card.
4. Pay a merchant. The trip card takes the full amount, then every card under it pays an equal share.
5. Close the trip when it is over.

Live bank rails and a real Apple Pay merchant ID are not connected yet. The trip still records the charge on the phone.

## Build the iPhone app

This is an iOS app. Do not use Expo Go, a QR code, or a website host.

On a Mac with Xcode installed:

```bash
cd iOS-trip
git checkout cursor/ios-trip-wallet-7340
npm install
npm run ios:release
```
