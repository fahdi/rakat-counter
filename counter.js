export class RakatCounter {
    constructor(options = {}) {
        this.rukuThreshold = options.rukuThreshold || -3.5;
        this.sajdahThreshold = options.sajdahThreshold || -7;
        this.standingThreshold = options.standingThreshold || -2; // Slightly more relaxed for sitting
        this.cooldown = options.cooldown === undefined ? 3000 : options.cooldown; // Higher cooldown to prevent double hits
        this.bufferSize = options.bufferSize || 10;

        this.count = 0;
        this.sajdahCount = 0;
        this.state = 'standing';
        this.buffer = [];
        this.lastSajdahTime = 0;
        this.mode = options.mode || 'mat';
        this.onCountChange = options.onCountChange || (() => { });
        this.onSajdahDetect = options.onSajdahDetect || (() => { });
        this.isDark = false;
        this.baseLight = 0;
        this.accelBuffer = [];
    }

    processPitch(pitch) {
        if (this.mode === 'mat') return; // In mat mode, we only listen for touch triggers

        this.buffer.push(pitch);
        if (this.buffer.length > this.bufferSize) {
            this.buffer.shift();
        }

        const avgPitch = this.buffer.reduce((a, b) => a + b, 0) / this.buffer.length;

        // Pocket Mode Logic (Motion)
        if (avgPitch <= this.sajdahThreshold) {
            if (this.state !== 'sajdah') {
                this.state = 'sajdah';
                this.processSajdahTrigger();
            }
        } else if (avgPitch >= this.standingThreshold) {
            this.state = 'standing';
        }
    }

    processLightLevel(brightness) {
        if (!this.baseLight) this.baseLight = brightness;

        // Trigger on 30% drop from baseline (more sensitive)
        const threshold = this.baseLight * 0.7;

        if (brightness < threshold && !this.isDark) {
            this.isDark = true;
            this.processSajdahTrigger();
        } else if (brightness > threshold + (this.baseLight * 0.1)) {
            this.isDark = false;
        }
    }

    processMotion(accel) {
        // Impact detection: total acceleration spike
        const total = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
        this.accelBuffer.push(total);
        if (this.accelBuffer.length > 5) this.accelBuffer.shift();

        const avg = this.accelBuffer.reduce((a, b) => a + b, 0) / this.accelBuffer.length;
        // Ultra-sensitive: 11m/s² (just above gravity baseline)
        if (total > avg * 1.2 && total > 11) {
            this.processSajdahTrigger();
        }
    }

    processSajdahTrigger() {
        const now = Date.now();
        // Debounce to avoid multiple counts for same movement
        if (now - this.lastSajdahTime >= this.cooldown) {
            this.sajdahCount++;
            this.lastSajdahTime = now;
            this.onSajdahDetect(this.sajdahCount);

            if (this.sajdahCount > 0 && this.sajdahCount % 2 === 0) {
                this.count++;
                this.onCountChange(this.count);
            }
            return true;
        }
        return false;
    }

    setMode(mode) {
        this.mode = mode;
        this.reset();
    }

    getCount() {
        return this.count;
    }

    reset() {
        this.count = 0;
        this.sajdahCount = 0;
        this.state = 'standing';
        this.buffer = [];
        this.lastSajdahTime = 0;
        this.isDark = false;
        this.baseLight = 0;
        this.accelBuffer = [];
    }
}
