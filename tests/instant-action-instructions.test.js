import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildDefaultSettings } from '../src/state/defaults.js';
import {
    buildInstantActionOpeningMessage,
    buildInstantActionPromptSection,
    MAX_INSTANT_ACTION_INSTRUCTION_LENGTH,
    normalizeInstantActionInstructions,
    resolveInstantActionPlayerCardWords,
} from '../src/state/instant-action-instructions.js';

const quickStartSource = readFileSync(new URL('../quickstart.js', import.meta.url), 'utf8');
const creatorSource = readFileSync(new URL('../character-creator.js', import.meta.url), 'utf8');
const rendererSource = readFileSync(new URL('../renderer.js', import.meta.url), 'utf8');

describe('Instant Action instructions', () => {
    it('preserves the original opening message when optional guidance is empty', () => {
        expect(buildInstantActionOpeningMessage('   ')).toBe('Begin the adventure');
    });

    it('sends the same one-time guidance with the opening adventure message', () => {
        expect(buildInstantActionOpeningMessage('A storm-battered frontier town')).toBe(
            'Begin the adventure.\n\nInitial Setup:\nA storm-battered frontier town',
        );
    });

    it('keeps setup details while interpreting numeric level or XP requests narratively', () => {
        const section = buildInstantActionPromptSection('A level 7 ranger with 4,000 XP and a fine bow');
        expect(section).toContain('A level 7 ranger with 4,000 XP and a fine bow');
        expect(section).toContain('translate that intent into narrative experience, training, or equipment quality');
        expect(section).toContain('without assigning a number or tracking XP');
    });

    it('trims and bounds one-time guidance', () => {
        const oversized = `  ${'x'.repeat(MAX_INSTANT_ACTION_INSTRUCTION_LENGTH + 50)}  `;
        expect(normalizeInstantActionInstructions(oversized)).toHaveLength(MAX_INSTANT_ACTION_INSTRUCTION_LENGTH);
    });

    it('supports preset and custom Player Card lengths with safe bounds', () => {
        expect(resolveInstantActionPlayerCardWords('400', '')).toBe(400);
        expect(resolveInstantActionPlayerCardWords('other', '850')).toBe(850);
        expect(resolveInstantActionPlayerCardWords('other', '')).toBe(150);
        expect(resolveInstantActionPlayerCardWords('other', '9000')).toBe(5000);
    });

    it('wires Initial Setup into character, Player Card, and narrator generation', () => {
        expect(rendererSource).toContain('id="rt-quickstart-instructions"');
        expect(quickStartSource).toMatch(/instructionsInput\?\.value \|\| ''/);
        expect(quickStartSource).toMatch(/generateQuickStartCharacter\(\{[\s\S]*?instantActionInstructions,/);
        expect(quickStartSource).toMatch(/generatePersonaBio\([\s\S]*?buildInstantActionPromptSection\(instantActionInstructions\)/);
        expect(quickStartSource).toContain('buildInstantActionOpeningMessage(instantActionInstructions)');
        expect(creatorSource).toContain('instantActionInstructions: opts.instantActionInstructions');
        expect(creatorSource).toContain('Create a level-free character');
    });

    it('removes numeric-level and random-level creator controls and saved defaults', () => {
        const defaults = buildDefaultSettings();
        expect(defaults).not.toHaveProperty('onboardingLevel');
        expect(defaults).not.toHaveProperty('onboardingInstantActionRandomLevel');
        expect(quickStartSource).not.toMatch(/randomLevel|onboardingInstantActionRandomLevel|onboardingLevel/);
        expect(rendererSource).not.toMatch(/rt-quickstart-random-level|Random Level\?/);
    });

    it('exposes a selectable Player Card word count in Instant Action', () => {
        expect(rendererSource).toContain('id="rt-quickstart-persona-words"');
        expect(rendererSource).toContain('id="rt-quickstart-persona-words-custom"');
        expect(quickStartSource).toContain('resolveInstantActionPlayerCardWords(');
    });

    it('keeps the Instant Action starter message optional and on by default', () => {
        expect(buildDefaultSettings().onboardingSendStarterMessage).toBe(true);
        expect(rendererSource).toContain('id="rt-quickstart-send-starter"');
        expect(rendererSource).toContain('Send Starter Message?');
        expect(rendererSource).toContain('If this is checked, the AI automatically starts the campaign as soon as the rolled character is ready.');
        expect(rendererSource).toContain("obSettings.onboardingSendStarterMessage !== false ? 'checked' : ''");
        expect(quickStartSource).toMatch(/if \(s\.onboardingSendStarterMessage !== false\)/);
        expect(quickStartSource).toMatch(/sendStarterCheckbox\?\.addEventListener\('change', persistQuickStartOptions\)/);
        expect(quickStartSource).toContain('Type your first action.');
    });
});
