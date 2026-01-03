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
        counter.setMode('pocket'); // Pocket mode uses pitch detection
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
        counter.setMode('pocket'); // Pocket mode uses pitch detection
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

    it('should handle light-based triggers (Mat Mode)', () => {
        counter.setMode('mat');
        // Initial calibration
        counter.processLightLevel(100);
        expect(counter.baseLight).toBe(100);

        // Sudden drop (below 70)
        counter.processLightLevel(50);
        expect(counter.sajdahCount).toBe(1);
        expect(counter.isDark).toBe(true);

        // Light returns (above 80)
        counter.processLightLevel(90);
        expect(counter.isDark).toBe(false);

        // Another drop
        counter.processLightLevel(40);
        expect(counter.sajdahCount).toBe(2);
        expect(counter.getCount()).toBe(1);
    });

    it('should handle motion-based (impact) triggers (Mat Mode)', () => {
        counter.setMode('mat');
        // Fill buffer with gravity (approx 9.8)
        for (let i = 0; i < 5; i++) counter.processMotion({ x: 0, y: 0, z: 9.8 });

        // Spike (above 13 and above avg * 1.3)
        counter.processMotion({ x: 0, y: 0, z: 20 });
        expect(counter.sajdahCount).toBe(1);
    });
});
