# Rakat Counter 📿

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
    3. **Transparency**: We updated the guide to explain *why* it might fail, moving from "It just works" to "It works, but here is what to do if your phone is being stubborn."

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
