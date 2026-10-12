import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { testExtensionSettings } from './setup.js';

vi.mock('../portrait-storage.js', () => ({
    lookupCustomPortraitSrc: () => '',
}));

import { RT_PROMPTS, DEFAULT_STOCK_PROMPTS, buildStartingGearHint } from '../constants.js';
import { buildModulesInstructionText, memoForGmContext, memoForTrackerContext } from '../memo-processor.js';
import { renderMemoAsCards, renderTabModeView, MARKER_TYPE_MAP } from '../renderer.js';
import { applyLevelFreeProgressionGuard, stripLegacyXpBlocks } from '../src/state/level-free-progression.js';

const legacyMemo = `[XP]
Level: 4 | XP: 3,250/6,500
[/XP]
[CHARACTER]
Hero: 12/12 HP
XP: 3,250/6,500
Level: 4
Gear: Sword [E]
[/CHARACTER]
[SPELLS]
Level 1 (2/2): Magic Missile
[/SPELLS]
[TIME]
Current Time: 08:00 AM, Day 1
[/TIME]`;

beforeEach(() => {
    for (const key of Object.keys(testExtensionSettings)) delete testExtensionSettings[key];
    localStorage.clear();
});

describe('level-free character progression', () => {
    it('makes the embedded default prompt match the user-edited prompt file', () => {
        const sourcePrompt = readFileSync(new URL('../sysprompt.txt', import.meta.url), 'utf8').replace(/\r\n/g, '\n').trim();
        expect(RT_PROMPTS['sysprompt.txt'].replace(/\r\n/g, '\n').trim()).toBe(sourcePrompt);
    });

    it('keeps legacy memo text stored while filtering XP and character-level state from active contexts', () => {
        const original = legacyMemo;
        const stripped = stripLegacyXpBlocks(legacyMemo);

        expect(legacyMemo).toBe(original);
        expect(stripped).not.toMatch(/\[XP\]|XP:\s*3,250|Level:\s*4/);
        expect(memoForTrackerContext(legacyMemo)).not.toMatch(/\[XP\]|XP:\s*3,250|Level:\s*4/);
        expect(memoForGmContext(legacyMemo)).not.toMatch(/\[XP\]|XP:\s*3,250|Level:\s*4/);
        expect(memoForTrackerContext(legacyMemo)).toContain('Gear: Sword [E]');
        expect(memoForTrackerContext(legacyMemo)).toContain('Current Time: 08:00 AM, Day 1');
        expect(memoForTrackerContext(legacyMemo)).toContain('Rank I (2/2): Magic Missile');
        expect(memoForTrackerContext(legacyMemo)).not.toContain('Level 1 (2/2)');
        expect(stripLegacyXpBlocks('[SPELLS]Level 1: Fire Bolt[/SPELLS]')).toContain('Rank I: Fire Bolt');
        expect(stripLegacyXpBlocks('[MAP]Level: 4[/MAP]')).toContain('Level: 4');
    });

    it('appends authoritative rules after saved prompt text without rewriting the input', () => {
        const savedPrompt = 'Legacy custom rule: award XP and increase the character level.';
        const effectivePrompt = applyLevelFreeProgressionGuard(savedPrompt);

        expect(savedPrompt).toContain('award XP');
        expect(effectivePrompt).toContain(savedPrompt);
        expect(effectivePrompt.indexOf('LEVEL-FREE PROGRESSION (AUTHORITATIVE)')).toBeGreaterThan(effectivePrompt.indexOf(savedPrompt));
        expect(effectivePrompt).toContain('credible practice, instruction, discovery, or use');
        expect(effectivePrompt).toContain('without use counters');
        expect(effectivePrompt).toContain('equipment quality, condition, fit, enchantments');
        expect(effectivePrompt).toContain('natural attributes and species-based maximum HP remain stable');
        expect(effectivePrompt).toContain('Starting gear follows the setting');
        expect(effectivePrompt).toContain('Use spell ranks');
    });

    it('keeps only generic PROGRESS markers active and hides stored XP data in rendered cards', () => {
        const cardView = renderMemoAsCards(legacyMemo, null, {});
        const tabView = renderTabModeView(legacyMemo, {}, null);

        expect(MARKER_TYPE_MAP.PROGRESS.renderType).toBe('progress');
        expect(MARKER_TYPE_MAP).not.toHaveProperty('XPBAR');
        expect(cardView).not.toMatch(/XP|3,250|Level: 4|data-tag="XP"/);
        expect(tabView).not.toMatch(/XP|3,250|Level: 4|data-tag="XP"/);
        expect(legacyMemo).toContain('[XP]');
    });

    it('uses rank spell slots and starting gear guidance without character-level scaling', () => {
        expect(DEFAULT_STOCK_PROMPTS.spells).toContain('Rank I (4/4)');
        expect(DEFAULT_STOCK_PROMPTS.spells).toContain('Rank II (3/3)');
        expect(DEFAULT_STOCK_PROMPTS.spells).not.toContain('Level 1 (');
        expect(buildStartingGearHint('fantasy', false, 'auto')).not.toMatch(/character level|starting level|level 1/i);
        expect(buildStartingGearHint('fantasy', false, 'auto')).toMatch(/setting|background|gear tier/i);
    });

    it('does not expose retired creator controls or XP-bar UI while preserving map-level wording', () => {
        const creator = readFileSync(new URL('../character-creator.js', import.meta.url), 'utf8');
        const quickstart = readFileSync(new URL('../quickstart.js', import.meta.url), 'utf8');
        const renderer = readFileSync(new URL('../renderer.js', import.meta.url), 'utf8');
        const markup = readFileSync(new URL('../src/ui/panel/panel-markup.js', import.meta.url), 'utf8');
        const wizard = readFileSync(new URL('../game-systems.js', import.meta.url), 'utf8');

        expect(creator).not.toMatch(/onboardingLevel|opts\.level|STARTING LEVEL/);
        expect(quickstart).not.toMatch(/randomLevel|onboardingInstantActionRandomLevel|onboardingLevel/);
        expect(renderer).not.toContain('rt-quickstart-random-level');
        expect(renderer).not.toContain('renderBottomXpBar');
        expect(markup).not.toContain('rt-bottom-xp-bar');
        expect(wizard).toContain('LEVEL_FREE_PROGRESSION_INSTRUCTIONS');
        expect(wizard).not.toContain('XP from practice');
        expect(RT_PROMPTS['sysprompt.txt']).toContain('map floors, map levels, and levels of detail');
    });

    it('keeps the retired stock XP module inactive even if legacy definitions remain saved', () => {
        const legacySettings = {
            stockPrompts: { xp: 'Award XP after each quest.' },
            modules: { xp: true },
            customFields: [{ tag: 'XP', enabled: true, prompt: 'Track XP and levels.' }],
        };
        const moduleText = buildModulesInstructionText(legacySettings);

        expect(moduleText).not.toContain('Award XP');
        expect(moduleText).not.toContain('Track XP and levels');
        expect(moduleText).toContain('LEVEL-FREE PROGRESSION (AUTHORITATIVE)');
        expect(legacySettings.stockPrompts.xp).toBe('Award XP after each quest.');
        expect(legacySettings.modules.xp).toBe(true);
        expect(legacySettings.customFields[0].enabled).toBe(true);
    });
});
