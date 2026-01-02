import { describe, it, expect, beforeEach } from 'vitest';
import { RakatCounter } from './counter.js';

describe('RakatCounter - 2 Sajdah Logic', () => {
    let counter;

    beforeEach(() => {
        counter = new RakatCounter({
            sajdahThreshold: -7,
            cooldown: 0,
            bufferSize: 1
        });
    });

    it('should count 1 rakat after 2 sajdah triggers', () => {
        // Sajdah 1
        counter.processPitch(-10);
        expect(counter.sajdahCount).toBe(1);
        expect(counter.getCount()).toBe(0);

        // Return to standing/neutral
        counter.processPitch(0);

        // Sajdah 2
        counter.processPitch(-10);
        expect(counter.sajdahCount).toBe(2);
        expect(counter.getCount()).toBe(1);
    });

    it('should work for users praying while sitting (tilt based)', () => {
        // Even if they don't fully "stand", as long as they return above the threshold
        counter.processPitch(-10); // Sajdah 1
        counter.processPitch(-2);  // "Up" enough to reset for next sajdah
        counter.processPitch(-10); // Sajdah 2
        expect(counter.getCount()).toBe(1);
    });

    it('should handle mat mode (manual triggers via touch)', () => {
        counter.setMode('mat');
        counter.processSajdahTrigger(); // 1
        counter.processSajdahTrigger(); // 2 -> +1 rakat
        expect(counter.getCount()).toBe(1);
    });
});
