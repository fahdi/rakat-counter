export class RakatCounter {
    constructor(options = {}) {
        this.rukuThreshold = options.rukuThreshold || -3.5;
        this.sajdahThreshold = options.sajdahThreshold || -7;
        this.standingThreshold = options.standingThreshold || -1;
        this.cooldown = options.cooldown === undefined ? 2000 : options.cooldown;
        this.bufferSize = options.bufferSize || 1; // Default to 1 for tests unless specified

        this.count = 0;
        this.state = 'standing';
        this.buffer = [];
        this.hasReachedSajdah = false;
        this.lastRakatTime = 0;
        this.onCountChange = options.onCountChange || (() => { });
    }

    processPitch(pitch) {
        this.buffer.push(pitch);
        if (this.buffer.length > this.bufferSize) {
            this.buffer.shift();
        }

        const avgPitch = this.buffer.reduce((a, b) => a + b, 0) / this.buffer.length;
        this.updateState(avgPitch);
    }

    updateState(avgPitch) {
        if (avgPitch < this.sajdahThreshold) {
            if (this.state !== 'sajdah') {
                this.state = 'sajdah';
                this.hasReachedSajdah = true;
            }
        } else if (avgPitch < this.rukuThreshold) {
            if (this.state !== 'sajdah') {
                this.state = 'ruku';
            }
        } else if (avgPitch > this.standingThreshold) {
            if (this.state !== 'standing') {
                this.checkRakatCompletion();
                this.state = 'standing';
            }
        }
    }

    checkRakatCompletion() {
        if (this.hasReachedSajdah) {
            const now = Date.now();
            if (now - this.lastRakatTime >= this.cooldown) {
                this.count++;
                this.lastRakatTime = now;
                this.onCountChange(this.count);
            }
            this.hasReachedSajdah = false;
        }
    }

    getCount() {
        return this.count;
    }

    getState() {
        return this.state;
    }

    reset() {
        this.count = 0;
        this.hasReachedSajdah = false;
        this.state = 'standing';
        this.buffer = [];
    }
}
