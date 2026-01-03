# Rakat Counter 📿

> [!IMPORTANT]
> **Recommended Version**: For automatic "Zero-Touch" counting during prayer, please use the [Rakat Counter Native App](https://github.com/fahdi/rakat-counter-native). This web version is now a manual tap counter.

> **"For those who seek focus, but find their mind wandering. Built with love for the forgetful, the distracted, and the sincere."**

Rakat Counter is a zero-distraction, automatic PWA designed to help Muslims keep track of their Rakahs during Salah. It targets the specific challenges faced by people with ADHD, OCD, or age-related memory issues, ensuring that the focus remains on the prayer, not the count.

---

## ❤️ A Heartfelt Journey

This project didn't start in a dev lab; it started on a prayer mat. 

We realized that for many, the struggle to remember which rakat they are on isn't just a minor inconvenience—it’s a source of anxiety that pulls them away from *Khushoo* (spiritual focus). Existing counters required manual button presses or looked like overly-complex gadgets. We wanted something that felt like it wasn't there at all. 

What you see today is the result of multiple "failed" ideas that eventually led to a "foolproof" solution.

---

## 🛠️ The Tech Stack

- **Vanilla JavaScript & CSS**: Zero frameworks, zero dependencies (except for testing).
- **Service Worker (PWA)**: Works 100% offline and installs directly to your home screen.
- **Screen Wake Lock API**: Keeps the phone from falling asleep and killing the sensors.
- **DeviceOrientation API**: Detects pitch and tilt for pocket-mode counting.
- **MediaDevices API**: Uses the front camera as a makeshift light sensor for automatic "no-touch" counting on the mat.
- **Vitest**: Pure Test-Driven Development (TDD) for core logic.

---

## 📝 Blog: The Evolution of a "Zero-Touch" Idea

### The Spark
The idea was simple: "Let the phone count for me." But the execution was anything but. We went through four major revisions, each solving a problem the previous one created.

### Revision 1: The "Pocket" Dream (Motion Sensors)
We started with **Pocket Mode**. The theory was that as you move from Standing to Ruku to Sajdah, the phone's pitch (Beta angle) changes. We wrote a state machine to track these transitions.
- **The Fail**: As soon as users put the phone in their pocket, the screen would turn off to save battery, and the browser would "pause" the sensors. The app died before the first Sajdah.
- **The Fix**: We implemented the **Screen Wake Lock API**, forcing the screen to stay "awake" even in a pocket.

### Revision 2: The "Manual Mat" (Tapping)
We pivot to a **Mat Mode** where the phone lies flat. We asked the user to tap the screen with their head.
- **The Fail**: UX was poor. If you are forgetful enough to lose count of rakats, you are forgetful enough to forget to tap the screen. Tapping felt like "work."

### Revision 3: The "2-Sajdah" Philosophy
We realized we were overcomplicating the math. A Rakat is defined by its prostrations. We simplified the internal logic: **2 Sajdahs = 1 Rakat**. This made the app work for people praying while sitting (who don't have dramatic pitch changes) and simplified the state machine.

### Revision 5: The Permission Paradox & The Manual Fallback
Even with perfect logic, we hit a wall: **Browser Privacy Security.**
- **The Issue**: Many modern browsers (especially Safari on iOS and Chrome on newer Androids) block sensor and camera access unless specific, sometimes hidden, permissions are granted. Users were left with a "frozen" counter.
- **The Solution**: 
    1. **Health Checks**: We added a startup "Health Check" that scans the phone's hardware. If it doesn't see sensors, it tells the user immediately via a warning banner.
    2. **Graceful Fallback**: The "Zero-Touch" dream is great, but the prayer is more important. We implemented a "Manual Tap" fallback. If sensors are blocked or missing, the status changes to "Manual Tap Mode," and the user can simply tap the big number on the screen to count their prostrations.
    3. **Hybrid Detection**: In Mat Mode, we now use a "Double-Layer" detection—measuring both **Light Drops** (camera) and **Impact Thumps** (accelerometer). If one fails (e.g., room is too dark), the other serves as a backup.
    4. **Revision 6: The Silicon Sensitivity Update**: We realized that a "soft" prostration wasn't triggering the sensors. We hyper-tuned the sensitivity:
        - **Impact**: Now detects thumps as light as 13 m/s² (barely 1.3G).
        - **Light**: Now triggers on a subtle 30% drop in brightness.
        - **Auto-Recalibration**: The app now re-scans the room's ambient light every 5 seconds, ensuring that if a cloud passes by or a light is turned on, the "darkness" detection remains razor-sharp.
    5. **Transparency**: We updated the guide to explain *why* it might fail, moving from "It just works" to "It works, but here is what to do if your phone is being stubborn."
    6. **The Silent Failure Hack**: During testing on Android and iOS, we found that sometimes sensors don't "error out"—they just stay silent. We added a vibration alert when setup fails so the user knows immediately that they need to switch to manual mode without looking at the screen.

### Revision 7: The Debugging & Testing Update
When users reported that proximity detection wasn't working, we needed a way to diagnose the issue remotely.
- **The Problem**: Sensors would work in tests but fail silently on real devices. We had no visibility into what was happening.
- **The Solution**:
    1. **Automated Test Suite**: Built comprehensive unit tests covering all detection modes (pocket, mat, light, motion). All 5 tests pass, confirming the logic is correct.
    2. **Live Debug Panel**: Added a visible debug console at the bottom of the screen showing real-time sensor data: camera status, light levels (with thresholds), accelerometer readings, and detection state.
    3. **Diagnostic Logging**: The app now reports exactly where failures occur (camera permission denied, sensor API missing, etc.) so users can troubleshoot their specific browser/device combination.

### Revision 8: The Accelerometer-Only Pivot
After extensive testing, we discovered that camera-based light detection was too unreliable across different browsers and devices.
- **The Decision**: Remove camera dependency entirely. Focus on what works: **pure accelerometer detection**.
- **The Implementation**:
    1. **Ultra-Sensitive Threshold**: Lowered to 11 m/s² (just above gravity's 9.8 m/s²) to detect even the gentlest head-to-mat contact.
    2. **Simplified Logic**: No more hybrid detection. One sensor, one job: detect the vibration/impact when your head touches the mat.
    3. **Zero Permissions Friction**: Accelerometer works on most browsers without explicit permission prompts (unlike camera).
    4. **Live Force Meter**: Debug panel shows real-time force readings so you can see exactly when the threshold is crossed.

### Revision 9: The Prayer Mat Paradox
Real-world testing revealed a fundamental flaw in the accelerometer approach.
- **The Discovery**: Prayer mats are designed to **absorb shock**. Even a solid thump on a wooden table produced less than 1 m/s² change (average stayed at 10 m/s² = gravity). On a soft prayer mat, the vibration dampening is even more extreme.
- **The Reality**: Accelerometer detection doesn't work for prayer mats. The very surface we're targeting is engineered to prevent the vibrations we're trying to detect.
- **The Conclusion**: Web sensors (camera blocked, accelerometer ineffective) cannot reliably detect prostrations. The "zero-touch" dream requires hardware access that browsers don't provide.
- **Next Steps**: 
    - **Option A**: Pivot to React Native for true hardware access (proximity sensor, better accelerometer APIs)
    - **Option B**: Accept manual tap as the primary interaction (PWA remains useful for counting, just not automatic)
    - **Option C**: Explore alternative triggers (audio detection, gyroscope patterns, etc.)

### Revision 10: The Religious Constraint
A critical requirement was discovered that eliminates all web-based solutions.
- **The Constraint**: Extra movements during Salah (prayer) that aren't part of the prayer can invalidate it. This means **manual tapping is not permissible** during prayer.
- **The Implication**: The app must be truly "zero-touch" - no manual interaction allowed during prayer.
- **The Reality**: Web browsers cannot provide the hardware access needed for zero-touch detection:
    - Camera: Blocked by permissions
    - Accelerometer: Prayer mats absorb vibrations
    - No proximity sensor API in browsers
- **The Solution**: **React Native** is required for access to the proximity sensor, which can detect when the head approaches the phone during Sajdah without requiring any extra movement.
- **Status**: This PWA will remain as a simple post-prayer counter. A native app is being developed for during-prayer automatic counting.

---

## 🚀 How to Install

1. Visit [https://fahdi.github.io/rakat-counter/](https://fahdi.github.io/rakat-counter/)
2. **iPhone**: Tap 'Share' -> 'Add to Home Screen'.
3. **Android**: Tap 'Install App' or 'Add to Home Screen'.

## 🔒 Privacy
**Zero data is ever sent to a server.** 
- The camera "sees" light levels locally—no images are saved or uploaded.
- The app works entirely offline.
- Your count is stored in your phone's local storage only.

---

*“May this small tool bring peace to your practice.”*
