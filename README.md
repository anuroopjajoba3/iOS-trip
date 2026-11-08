# Trip wallet

Sign up. Start your own trip. Name the trip card. Bring friends.

Merchants charge that one trip card for the full amount. Two funding cards sit behind it. Two caps must sum to the cart, or the whole cart is declined.

## Use

1. Sign up or log in.
2. Start a trip: name, dates, city, trip card name, and your Visa and Mastercard.
3. Invite people and share.
4. Add photos, receipts, and a map of the city.
5. Pay a merchant. Split caps evenly, or type them. Apple Pay is the confirm step on the trip card.
6. Close the trip when it is over.

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
