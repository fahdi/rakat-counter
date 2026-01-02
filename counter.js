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
        this.mode = options.mode || 'pocket';
        this.onCountChange = options.onCountChange || (() => { });
        this.onSajdahDetect = options.onSajdahDetect || (() => { });
    }

    processPitch(pitch) {
        if (this.mode === 'mat') return; // In mat mode, we only listen for touch triggers

        this.buffer.push(pitch);
        if (this.buffer.length > this.bufferSize) {
            this.buffer.shift();
        }

        const avgPitch = this.buffer.reduce((a, b) => a + b, 0) / this.buffer.length;
        this.updateState(avgPitch);
    }

    updateState(avgPitch) {
        if (avgPitch <= this.sajdahThreshold) {
            if (this.state !== 'sajdah') {
                this.state = 'sajdah';
                this.processSajdahTrigger();
            }
        } else if (avgPitch >= this.standingThreshold) {
            this.state = 'standing';
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
    }
}
