# iOS Build Guide

## Current Issue

If you encounter an error about "iOS 26.1 is not installed" when running `npm run ios`, this is due to an SDK/runtime version mismatch. Here are solutions:

## Solution 1: Use Xcode Directly (Recommended)

1. Open the project in Xcode:
   ```bash
   open ios/CELIA.xcworkspace
   ```

2. In Xcode:
   - Select a simulator from the device dropdown (top toolbar)
   - Choose any iPhone simulator running iOS 18.6 or iOS 26.0
   - Press `Cmd + R` to build and run

## Solution 2: Install iOS 26.1 Runtime

1. Open Xcode
2. Go to **Xcode > Settings > Components** (or **Xcode > Preferences > Components**)
3. Download and install **iOS 26.1** runtime if available
4. Restart Xcode

## Solution 3: Use EAS Build for Development

Build a development client using EAS:

```bash
npm run build:dev:ios
```

Then install the build on your device and connect with:
```bash
npm start
```

## Solution 4: Specify Simulator Explicitly

Try booting a specific simulator first:

```bash
# List available simulators
xcrun simctl list devices available

# Boot a specific simulator (e.g., iPhone 16 Pro on iOS 18.6)
xcrun simctl boot "iPhone 16 Pro"

# Open Simulator app
open -a Simulator

# Then try building
npm run ios
```

## Alternative: Build for Android First

If iOS continues to have issues, you can test on Android:

```bash
npm run android
```

Make sure you have:
- Android Studio installed
- Android SDK configured
- An emulator running or device connected

