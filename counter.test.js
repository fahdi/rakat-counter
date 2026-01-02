import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RakatCounter } from './counter.js';

describe('RakatCounter', () => {
    let counter;

    beforeEach(() => {
        counter = new RakatCounter({
            rukuThreshold: -3.5,
            sajdahThreshold: -7,
            standingThreshold: -1,
            cooldown: 0 // set to 0 for easier testing
        });
    });

    it('should start with 0 rakahs', () => {
        expect(counter.getCount()).toBe(0);
    });

    it('should detect a rakat after standing -> sajdah -> standing sequence', () => {
        // Standing
        counter.processPitch(0);
        expect(counter.getState()).toBe('standing');

        // Sajdah
        counter.processPitch(-8);
        expect(counter.getState()).toBe('sajdah');

        // Return to standing
        counter.processPitch(0);
        expect(counter.getState()).toBe('standing');
        expect(counter.getCount()).toBe(1);
    });

    it('should not count a rakat if it only goes to ruku', () => {
        counter.processPitch(0);
        counter.processPitch(-5); // Ruku
        expect(counter.getState()).toBe('ruku');
        counter.processPitch(0);
        expect(counter.getCount()).toBe(0);
    });

    it('should respect the cooldown', () => {
        counter = new RakatCounter({
            rukuThreshold: -3.5,
            sajdahThreshold: -7,
            standingThreshold: -1,
            cooldown: 1000
        });

        counter.processPitch(-8); // Sajdah
        counter.processPitch(0);  // Stand -> +1
        expect(counter.getCount()).toBe(1);

        counter.processPitch(-8); // Sajdah
        counter.processPitch(0);  // Stand -> should still be 1 due to cooldown
        expect(counter.getCount()).toBe(1);
    });

    it('should handle buffering for stability', () => {
        // If we have a buffer, a single noisy reading shouldn't change state immediately
        // For this test, let's assume a buffer size of 5
        counter = new RakatCounter({ bufferSize: 5 });

        // Standing
        for (let i = 0; i < 5; i++) counter.processPitch(0);
        expect(counter.getState()).toBe('standing');

        // One noisy reading -7 (sajdah) shouldn't flip it yet if avg is still high
        counter.processPitch(-10);
        // Avg would be (0*4 - 10)/5 = -2. -2 is Ruku threshold? 
        // actually let's just check it doesn't reach sajdah
        expect(counter.getState()).not.toBe('sajdah');
    });
});
