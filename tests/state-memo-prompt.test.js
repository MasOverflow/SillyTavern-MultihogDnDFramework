import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { RT_PROMPTS } from '../constants.js';

const RULE = 'Never audit, reconstruct, reconcile, or update its resource totals from earlier narration or logs; an external tracker handles resource accounting.';
const DEPLETED_RESOURCE_GUARD = 'never use a depleted resource, e.g. cast a Rank I spell at 0/4.';

describe('authoritative state memo resource guidance', () => {
    it('ships the rule in modern and legacy prompt sources and fallbacks', () => {
        const modern = readFileSync(new URL('../sysprompt.txt', import.meta.url), 'utf8');
        const legacy = readFileSync(new URL('../sysprompt_legacy.txt', import.meta.url), 'utf8');

        expect(modern).toContain('- ## TRACKER STATE 0 (Current) - passed every turn, is mechanical law.');
        expect(modern).toContain(RULE);
        expect(modern).toContain(DEPLETED_RESOURCE_GUARD);
        expect(RT_PROMPTS['sysprompt.txt']).toContain('- ## TRACKER STATE 0 (Current) - passed every turn, is mechanical law.');
        expect(RT_PROMPTS['sysprompt.txt']).toContain(RULE);
        expect(RT_PROMPTS['sysprompt.txt']).toContain(DEPLETED_RESOURCE_GUARD);
        expect(legacy).toContain('- ## TRACKER STATE 0 (Current) - passed every turn, is mechanical law.');
        expect(legacy).toContain(RULE);
        expect(legacy).toContain(DEPLETED_RESOURCE_GUARD);
        expect(legacy).not.toContain('award XP inline');
        expect(legacy).not.toContain('<level_up_protocol>');
    });
});
