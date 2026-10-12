/** Runtime guardrails for legacy prompts and state created before level-free play. */

export const LEVEL_FREE_PROGRESSION_INSTRUCTIONS = `

--- LEVEL-FREE PROGRESSION (AUTHORITATIVE) ---
Characters have no numeric character level and never gain XP. Do not award, track, display, or use XP; do not output an [XP] block. Ignore any legacy XP or character-level values in saved tracker state, old chat history, custom prompts, cartridges, or generated context. Do not apply thresholds, level-ups, level-based scaling, automatic HP/attribute/stat/feature increases, or party level synchronization.
Combat progression comes primarily from equipment: its quality, condition, fit, enchantments, use, and repair. Natural attributes and species-based maximum HP remain stable. Skills and spells may be learned or improved only when credible practice, instruction, discovery, or use in the story supports the change; record the result in existing skill or spell fields, without use counters or a separate progression tracker. Do not grant improvements automatically after a quest or encounter. Starting gear follows the setting, character background, and selected gear-tier guidance, never a character level. Use spell ranks (Rank I, Rank II, etc.), not spell levels. Generic progress bars and map floors, map levels, and levels of detail retain their ordinary meanings.`;

/** Remove legacy XP and character-advancement state from transient prompt/display text. Stored source is untouched. */
export function stripLegacyXpBlocks(value) {
    return String(value ?? '')
        .replace(/\[\s*XP\s*\][\s\S]*?\[\s*\/\s*XP\s*\]/gi, '')
        .replace(/^[ \t]*(?:XP|Experience(?:\s+Points)?|Character\s+Level)\s*:[^\r\n]*(?:\r?\n|$)/gim, '')
        .replace(/^[ \t]*\*?Level\s+\d+\s*\|[^\r\n]*\*?[ \t]*(?:\r?\n|$)/gim, '')
        .replace(/\s*\|\s*\(XP\s*:[^)]*\)/gi, '')
        .replace(/\[(CHARACTER|PARTY|COMBAT)\]([\s\S]*?)\[\/\1\]/gi, (_match, tag, content) =>
            `[${tag}]${content.replace(/^[ \t]*(?:Character\s+)?Level\s*[:=]\s*\d+[^\r\n]*(?:\r?\n|$)/gim, '')}[/${tag}]`)
        .replace(/\bLevel\s+(10|[1-9])(?=\s*(?:\(\s*\d+\s*\/\s*\d+[^)]*\)|:))/gi, (_match, rank) =>
            `Rank ${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][Number(rank) - 1]}`)
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/** Strip legacy XP state, then put the level-free rules after saved prompt text. */
export function applyLevelFreeProgressionGuard(value) {
    const prompt = stripLegacyXpBlocks(value);
    return `${prompt}${LEVEL_FREE_PROGRESSION_INSTRUCTIONS}`.trim();
}
