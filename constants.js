/**
 * constants.js — Multihog D&D Framework
 * All static, hardcoded data. No logic, no side effects.
 * Imported by: state-manager.js, memo-processor.js, renderer.js, panel.js, settings-ui.js
 */

import { LEVEL_FREE_PROGRESSION_INSTRUCTIONS } from './src/state/level-free-progression.js';

// ── Example strings shown in the custom field editor ──────────────────────────

export const EXAMPLES = `((B)) Health: 45/100
((PROGRESS)) Training: 4/10
((PLS)) Skills: Stealth (Expert), Deception (Proficient)
((BDG)) Status: Inspired
((HGT)) Emphasis: (Special Item)
((TEXT)) Note: Simple text row.`;

export const COLOR_EXAMPLES = `<font color=#ff5555>Red Text</font>
<font color=#55ff55>Green Text</font>
<font color=#5555ff>Blue Text</font>
<font color=#ffff55>Yellow Text</font>

[Uncommon] Green Item
[Rare] Blue Item
[Epic] Purple Item
[Legendary] Orange Item
[Artifact] Artifact Item`;

// ── Default module prompts ─────────────────────────────────────────────────────

/** Stock-prompt APR note (sysprompt uses <attacks_per_round> instead). */
export const ATTACKS_PER_ROUND_STOCK_HINT = `APR: Second attack at exactly BAB +8, at −5. DUAL-WIELDING (two light/one-handed melee weapons or offhand weapon equipped) adds one further offhand attack at −5 from base total, with NO ability modifier added to offhand damage (unless a trait/feat overrides this) — this is the only way to exceed 2 attacks. Maximum 3 attacks per round, ever.

Pre-calculate on the Combat line: Ranged (1 attack / 2 attacks / 3 attacks): +X or +C/+D | Melee (1 attack / 2 attacks / 3 attacks): +X, +A/+B, or +A/+B/+C.
Grammar: use singular "attack" when N=1; plural "attacks" when N≥2. Never write "1 attacks".
- N=1: below BAB +8, no offhand weapon → (1 attack)
- N=2: BAB +8+ (no offhand), OR below BAB +8 with dual-wielding (primary + offhand at −5) → (2 attacks)
- N=3: BAB +8+ AND dual-wielding (primary, primary second at −5, offhand at −5) → (3 attacks)

When training or equipment changes the actual combat line, recalculate N and update the Combat line accordingly. Never scale it by character level.`;

/** How Combat-line Melee/Ranged totals are derived (used in stock prompts). */
export const ATTACK_TOTAL_FORMULA_HINT = `ATTACK TOTALS: Melee Total Formula: Melee Total = BAB + STR modifier + Weapon enhancement bonus. Ranged Total Formula: Ranged Total = BAB + DEX modifier + Weapon enhancement bonus. The Melee and Ranged values on the Combat line are these totals (weapon enhancement = +1/+2/+3 from the equipped weapon; 0 if mundane). Finesse: melee attacks with finesse weapons (rapier, dagger, scimitar, etc.) use DEX modifier instead of STR when the wielder benefits. ${ATTACKS_PER_ROUND_STOCK_HINT}`;

export const DEFAULT_STOCK_PROMPTS = {
  character: `Main character's core stats. MECHANICS ONLY: Never include Identity, Background, Appearance, personality, biography, or other narrative/lore fields in [CHARACTER]. Use this format:
[CHARACTER]
{{user}} (Class): current/max HP
Combat: BAB: +X | Ranged (1 attack / 2 attacks / 3 attacks): +X or +C/+D | Melee (1 attack / 2 attacks / 3 attacks): +X, +A/+B, or +A/+B/+C | Base AC: X | Total AC: Z
Gear: Weapon1 (stats) | Weapon2, if exists, (stats) | Armor Name (+Y AC)
Proficiencies: Category1, Category2
Attr: STR X (mod), DEX X (mod), CON X (mod), INT X (mod), WIS X (mod), CHA X (mod)
Saves: Fort +X | Ref +X | Will +X
Skills: Skill1 +X, Skill2 +X
Traits: Trait1 (effect), Trait2 (effect)
HD: dX (current/max)
Status: Effect (duration Xh Xm)
[/CHARACTER]

AC CALCULATION: Calculate Total AC as Base AC (usually 10 + DEX modifier) plus the sum of AC bonuses from all equipped items (items under [INVENTORY] tagged with '[E]', e.g. Shield (+2 AC) or Plate Armor (+8 AC)).
${ATTACK_TOTAL_FORMULA_HINT}
Keep natural attributes and species-based maximum HP stable. Record skill or spell learning/improvement in the existing fields only when credible story events support it; equipment is the main source of combat progression.`,
  party: `Companion/Party members. MECHANICS ONLY: Never include Identity, Background, Appearance, personality, biography, or other narrative/lore fields in [PARTY]. Use this format for each member:
Name (Class): current/max HP
Combat: BAB: +X | Ranged (1 attack / 2 attacks / 3 attacks): +X or +C/+D | Melee (1 attack / 2 attacks / 3 attacks): +X, +A/+B, or +A/+B/+C | Base AC: X | Total AC: Z
Gear: Weapon (stats) | Armor Name (+Y AC)
Proficiencies: Category1, Category2
Attr: STR X (mod), DEX X (mod), CON X (mod), INT X (mod), WIS X (mod), CHA X (mod)
Saves: Fort +X | Ref +X | Will +X
Skills: Skill1 +X, Skill2 +X
Traits: Trait1 (effect), Trait2 (effect)
Abilities: Ability1 (specific trigger/action, mechanical effect, save/DC if any; uses remaining/max), Ability2 (specific effect; uses remaining/max)
Spells: Cantrips: Spell1, Spell2
Spells: Rank I (avail/max): Spell1, Spell2
HD: dX (current/max)
Status: Effect (duration Xh Xm)

${ATTACK_TOTAL_FORMULA_HINT}

For spells: output ONE \`Spells:\` line per spell rank. Do NOT merge multiple ranks onto one line with pipes.

[PARTY] is the active roster (max 5 + {{user}}). Temporary separations are handled by the separate [BENCHED PARTY] module via [BENCH]/[UNBENCH] commands — do NOT remove members from [PARTY] for benching, and do NOT output [PARTY] on a turn where your only roster change is benching someone (output [BENCH] only; code removes them). If [BENCHED PARTY] is disabled, separations are just narration and nothing here changes.

TRIGGERS:
- ADD a new member if you see (X joins the party.)
- REMOVE a member entirely ONLY if you see the exact annotation *(Left the party: X — reason)* — do NOT infer this from narration alone, no matter how final it looks. This is a hard, permanent deletion, so it always requires this exact string with no exceptions. (This applies regardless of whether [BENCHED PARTY] is enabled — remove the member from whichever block currently holds them.)

PERSISTENCE: If [PARTY] changes, you MUST output the ENTIRE block (all remaining members), per standard BLOCK PERSISTENCE rules. If it had no changes this turn, omit it entirely from your output.

Example: [PARTY]Elara (Ranger): 26/45 HP
Combat: BAB: +3 | Ranged (1 attack): +6 | Melee (1 attack): +4 | Base AC: 13 | Total AC: 15
Gear: Shortbow (1d6+3 Piercing) | Leather Armor (+2 AC)
Proficiencies: Simple Weapons, Martial Weapons
Attr: STR 12 (+1), DEX 16 (+3), CON 14 (+2), INT 10 (+0), WIS 14 (+2), CHA 12 (+1)
Saves: Fort +3 | Ref +5 | Will +2
Skills: Athletics +3, Perception +5
Traits: Natural Explorer (ignore difficult terrain)
Abilities: Archer's Focus (1/1, +2 attack)
Spells: Cantrips: Mage Hand
Spells: Rank I (2/2): Hunter's Mark, Goodberry
HD: d10 (5/5)
Status: Healthy
[/PARTY]

SPELL AND ABILITY USE: track PARTY spell slots and ability use accurately.`,
  'benched party': `Members temporarily separated from {{user}} while reunion remains plausible. Code moves their full [PARTY] stat sheet automatically — never output stat blocks here.

Output [BENCHED PARTY] only when a bench or unbench occurs this turn; otherwise omit entirely. Always close the block: \`[/BENCHED PARTY]\`. Do NOT also output [PARTY] on a bench/unbench turn — code handles roster moves. If other [PARTY] members had real changes (HP, gear, status, etc.), output [PARTY] for those changes only; still do not list the benched/unbenched member there.

One command per line inside the block:
- [BENCH] Name — reason   — member separates. Name may be first name only (e.g. Robin) or full header (Robin (Class)). Reason required; derive from narrative.
- [UNBENCH] Name— member reunites with {{user}} on-screen.

Infer benching/reunion from the narrative — no GM annotation exists for either. Bias toward under-triggering on bench: brief scene absence is NOT a bench. Wrong bench is worse than a missed one (missed benches self-heal on a later turn).

Permanent removal uses *(Left the party: Name — reason)* from the [PARTY] module, not these commands. NEVER REMOVE A CHARACTER FROM [PARTY] WITHOUT SEEING THIS STRING IN THE NARRATIVE; if someone (or {{user}}) leaves, use [BENCH], not removal of [PARTY] members.

Example (bench only — no [PARTY] output):
[BENCHED PARTY]
[BENCH] Gareth — stayed at the lodging to rest and study
[/BENCHED PARTY]

Example (reunite only):
[BENCHED PARTY]
[UNBENCH] Gareth
[/BENCHED PARTY]

Bench ETAs: If it is clearly implied in the narrative when a character may return, incorporate an ETA in the [BENCH] line itself, appended after the reason, using the format [BENCH] Name — reason — ETA: [when]. Only include the ETA segment when the narrative gives a real signal (a stated day, a duration, or an explicit "back by X"); do not fabricate a timeframe if the story is vague. Omit the ETA segment entirely rather than guessing — an absent ETA is always safer than a wrong one, consistent with the existing bias toward under-triggering.

The ETA must always be an explicit timestamp, e.g. "Day 1, HH:MM", or "17/10/2002, HH:MM." Only [UNBENCH] when the character physically reunites with {{user}}, not simply when the ETA date has been met.

ETA [BENCH] example: Status: Benched (08:08 AM, Day 1, separated to investigate the docks and meet back at Day 1, 12:10 AM)`,
  combat: `Active enemies and temporary allied NPCs in combat. Track the current COMBAT ROUND starting from 1. Decrement buff/debuff durations by 1 each round.

Group combatants under ENEMIES: and NON-PARTY ALLIES: headers, with ENEMIES first. NON-PARTY ALLIES means exactly that: allied combatants who are NOT listed in [PARTY]. Never put any [PARTY] member in [COMBAT]. Always include both headers when non-party allies are present. If there are no non-party allies, include ENEMIES: only.

Output fields in this exact order for every combatant. Choose MARTIAL or CASTER Att/def + Spells rules below — never mix styles on the same combatant.

COMBAT ROUND X
ENEMIES:
Name: current/max HP
Att/def: (see MARTIAL or CASTER)
Saves: Fort +X, Ref +X, Will +X
Abilities: Ability1 (effect), Ability2 (effect)
Spells: (CASTER only — one line per spell rank, same format as [PARTY])
Other: Trait1 (description), Trait2 (description)
Status: Effect (duration)

NON-PARTY ALLIES:
Name: current/max HP
(Use the same fields and ordering as above.)

MARTIAL (fighters, beasts, thugs — omit Spells: entirely):
Att/def: Weapon (1 attack / 2 attacks / 3 attacks, +X / damage) | Armor (AC: Z)
Example:
Bandit: 18/18 HP
Att/def: Longsword (1 attack, +5 / 1d8+2 Slashing) | Scale Mail (AC: 15)
Saves: Fort +4, Ref +2, Will +1
Abilities: Pack Tactics
Other: Soldier Tier
Status: Healthy

CASTER (mages, priests, warlocks — must include Spells: lines):
Att/def: Spell Atk +X | Spell DC Y | Backup Weapon (1 attack, +Z / damage) | Armor (AC: Z)
Spells: Cantrips: Spell1, Spell2
Spells: Rank N (avail/max): Spell1, Spell2
Example:
Cultist Acolyte: 15/15 HP
Att/def: Spell Atk +4 | Spell DC 14 | Dagger (1 attack, +1 / 1d4-1 Piercing) | Robes (AC: 11)
Saves: Fort +1, Ref +2, Will +3
Abilities: Spellcasting
Spells: Cantrips: Fire Bolt, Prestidigitation
Spells: Rank I (2/2): Magic Missile, Shield
Other: Soldier Tier Spellcaster
Status: Healthy

Example (Elite tier, demonstrating the 2-attack case):
Elite Enforcer: 42/42 HP
Att/def: Warhammer (2 attacks, +9/+4 / 1d10+4 Bludgeoning) | Plate Armor (AC: 17)
Saves: Fort +5, Ref +3, Will +4
Abilities: Brutal Strike (On a Warhammer hit, deal +1d10 Bludgeoning damage and force a Fort DC 16 save or knock the target prone; 2/2)
Other: Elite Tier
Status: Healthy

Example (Elite dual-wielder, showing the 3-attack case):
Elite Duelist: 40/40 HP
Att/def: Twin Shortswords (3 attacks, +9/+4/+4 / 1d6+3 Piercing) | Studded Leather (AC: 16)
Saves: Fort +4, Ref +6, Will +3
Abilities: Dual Strike (When both a primary-hand and offhand attack hit the same target in one turn, deal +1d6 Piercing damage; 2/2)
Other: Elite Tier, Dual-Wielder
Status: Healthy

Rules:
- Pre-calculate Spell Atk, Spell DC, and weapon bonuses when the enemy is first declared; use listed values directly — do not invent or re-derive mid-fight.
- Martial: weapon Attack is the primary threat. Never output Spells:.
- Caster: Spell Atk for spell attack rolls; Spell DC for saving-throw spells. Backup weapon Attack should be weaker than Spell Atk. Output ONE Spells: line per rank (Cantrips, then Rank I, Rank II, etc.) and track avail/max slots as they are spent.
- Hybrid gishes: use the CASTER Att/def + Spells pattern; backup weapon may match martial Attack of the same tier.
- APR: second attack unlocks at total Attack bonus +8, at −5. DUAL-WIELDING is the only way an NPC exceeds 2 attacks: an offhand weapon adds one further attack at −5 from base total, no ability modifier on offhand damage unless a trait says otherwise. Maximum 3 attacks per round, ever, regardless of tier.
- Weapon notation reflects this directly: Weapon (1 attack / 2 attacks / 3 attacks, +X, +A/+B, or +A/+B/+C / damage) | Armor (AC: Z). Use singular "attack" when N=1; plural "attacks" when N≥2 — never "1 attacks". A dual-wielding NPC below Attack +8 shows N=2 (primary/offhand); at Attack +8+ shows N=3 (primary/primary second/offhand).
- TIER BANDS for creating enemies on user request if there's no current narrative to record them from (keep Attack/Spell DC within the declared tier — do not mix bands):
  Minion: Attack +0–2 | Spell DC 12–14
  Soldier: Attack +3–6 | Spell DC 14–18
  Elite: Attack +7–10 | Spell DC 18–23
  Boss: Attack +11–15 | Spell DC 23–28
  Legendary: Attack +16–20+ | Spell DC 28–33+
- Firearms (new combatant damage — including enemies you invent when the GM didn't supply stats): ~2–3× typical D&D/PF firearm dice for lethality. Reasonable pistol baseline: 2d8+1 (not 1d8+2); rifle/shotgun higher. Attack bonuses stay normal — only damage scales. Never convert mid-fight.
- DEFEATED COMBATANTS: Mark defeated enemies as Status: Defeated. Do not omit them from the memo.

You MUST output \`[COMBAT]END_COMBAT[/COMBAT]\` when the narrative ends combat. Do not put members of [PARTY] into [COMBAT]

SPELL AND ABILITY USE: track COMBAT spell slots and ability use accurately.`,
  inventory: `Items, loot, equipment, and wealth. You MAY create this section if loot is found and it doesn't currently exist.

Organize into two sections using plain-text headers:
- Gear: — weapons, armor, and worn/equipped items
- Other Items: — potions, tools, miscellaneous loot, and currency

MANDATORY FORMAT FOR EVERY ITEM:
- Every item MUST have a rarity classification tag: [Common], [Uncommon], [Rare], [Epic], [Legendary], or [Artifact]
- Every item MUST have a thematic emoji prefix before the rarity tag
- Magical weapons/armor MUST use D&D suffix naming: "Weapon Name +1/+2/+3" (e.g. Shadow Longsword +1, Vampire's Blade +2) — NEVER "+1 Weapon Name"
- Gear with combat stats MUST include them in parentheses before the worth: e.g. (1d8+1 Slashing) or (AC +2)
- Every item MUST have an estimated worth at the end: (~X currency) where currency fits the world setting (GP, SP, CP, Dollars, Caps, etc.)
- Bare currency (e.g. "💰 1,200 GP" or "💵 $500") goes under Other Items — no rarity tag needed. Use "💵" for modern/paper currency (like Dollars) and "💰" for gold/coins.

EQUIPPED ITEMS: Tag any actively worn or held item with [E] immediately after the rarity tag.
- An item in 'Gear:' without [E] is carried but NOT currently worn or held.

Example:
[INVENTORY]
Gear:
- 🗡️ [Rare] [E] Flame Dagger +1 (1d6+2 Fire, +1 to hit) (~350 GP)
- 🛡️ [Common] Iron Buckler (AC +2) (~15 GP)
Other Items:
- 🧪 [Uncommon] Healing Potion (Restores 2d4+2 HP) (~50 GP)
- 🪢 [Common] Rope, 50 ft (~1 GP)
- 💰 1,200 GP
[/INVENTORY]`,
  abilities: `Non-spell class features and active abilities ONLY (e.g. Lay on Hands, Action Surge). NEVER mix these with spells. Format each entry as: \`Ability Name (brief description)\`.

Every ability that is use-limited must have its uses in the parentheses, for example: "Silver-Tongued Pivot (Allows the reroll of a failed social check by seamlessly shifting the narrative framing, 1/1 per rest)". At-will / passive abilities omit a uses count.`,
  spells: `Spell slots and spells known, grouped by rank. Format each line as: \`Rank N (avail/max): Spell1, Spell2\`. For cantrips, use \`Cantrips: Spell1, Spell2\`. Track slot usage accurately. NEVER mix these with abilities.

Example:
[SPELLS]
Rank I (4/4): Hunter's Mark, Longstrider, Detect Magic
Rank II (3/3): Pass Without Trace, Lesser Restoration
[/SPELLS]`,
  time: `Current time and day grabbed from the status footer. Also track time of the last rest (only on Long Rest, e.g. 'Last Rest: 10:00 PM, Day 0'). Use this to track out-of-combat buff durations by comparing to the PRIOR MEMO's time.

Format:
Last Rest: HH:MM AM/PM, Day N
Current Time: HH:MM AM/PM, Day N

'Last Rest' is ONLY triggered on Long Rest, NOT Short Rest (when Hit Dice, etc, are spent.) If the [TIME] delta between PREVIOUS STATE MEMO and your current update is only an hour, it is a Short Rest.`,
  quests: `Track quests using the [QUESTS] block. Only add a quest if {{user}} clearly takes on a task, even self-imposed. A quest/task simply being listed or offered does not mean it is accepted. The engine archives completed and failed quests automatically — output only active quests in [QUESTS].

Format each quest exactly as shown. NEVER deviate from this format, even if the narrative presents quests in a different one:

QUEST: The Missing Sheep
  ID: quest_1746703200000
  STATUS: active
  GIVER: Farmer Hemwick @ Crestwood Mill
  ACCEPTED: 08:00 AM, Day 1
  DEADLINE: 06:00 PM, Day 4
  REWARD: 100 GP
  REWARD: Hemwick's family heirloom
  FRUSTRATION_COEFF: 1.2
  OBJ_ACTIVE: Find the missing sheep
  OBJ_ACTIVE: Collect 6 Phosphor-Cap mushrooms [4/6]
  OBJ_TOTAL: 6
  OBJ_COMPLETED: Ask about the wolf
  OBJ_FAILED: Save the lamb
- Use OBJ_ACTIVE / OBJ_COMPLETED / OBJ_FAILED markers.
- Append ' (optional)' only if the task is not required.
- For collection/count objectives, append [current/total] after the text (e.g. [4/6]) and add an OBJ_TOTAL line with the total. Update the count each turn as progress is made.
- Keep objectives few and broad (clear, completable outcomes — not step-by-step routes); prefer 1–3. Do not rewrite/rephrase existing OBJ lines without cause, and do not keep adding granular micro-steps as the scene unfolds — only mark OBJ_COMPLETED/OBJ_FAILED or update [progress/total] counts.
- For rewards, use the REWARD marker (e.g. REWARD: 50 Gold). List multiple rewards on separate lines.
- Do not output a DIFFICULTY field — a quest's danger follows narrative logic only (e.g. a bandit camp raid is plainly easier than slaying a dragon). If {{user}} accepts a task beyond them, that's on them; nothing tracks or softens it.
- Only use DEADLINE if the quest has a time limit.
- For NPC-given quests only (someone expects completion), set FRUSTRATION_COEFF from the quest giver's personality: 0.4 = very patient, 1.0 = normal, 3.0 = volatile. Do not change it on later turns unless the narrative establishes a permanent temperament shift.
- For emergent/self-imposed quests: set TYPE: emergent and use GIVER: Self @ —.
- Omit FRUSTRATION_COEFF for emergent/self-imposed quests (no NPC expects completion).
- Do not output the MOOD field — the engine calculates and injects it automatically.
- When a quest completes or fails, set STATUS to completed or failed on that quest.
- When the player clearly completes an objective, mark it as OBJ_COMPLETED.`,
  time_24h: `Current time and day grabbed from the status footer. Also track time of the last rest (only on Long Rest, e.g. 'Last Rest: 22:00, Day 0'). Use this to track out-of-combat buff durations by comparing to the PRIOR MEMO's time.

Format (24-hour clock, NO AM/PM):
Last Rest: HH:MM, Day N
Current Time: HH:MM, Day N

'Last Rest' is ONLY triggered on Long Rest, NOT Short Rest (when Hit Dice, etc, are spent.) If the [TIME] delta between PREVIOUS STATE MEMO and your current update is only an hour, it is a Short Rest.`,
  time_ddmmyy: `Current time and date grabbed from the status footer. Also track time of the last rest (only on Long Rest, e.g. 'Last Rest: 10:00 PM, 01/01/2026'). Use this to track out-of-combat buff durations by comparing to the PRIOR MEMO's time.

Format:
Last Rest: HH:MM AM/PM, DD/MM/YYYY
Current Time: HH:MM AM/PM, DD/MM/YYYY

'Last Rest' is ONLY triggered on Long Rest, NOT Short Rest (when Hit Dice, etc, are spent.) If the [TIME] delta between PREVIOUS STATE MEMO and your current update is only an hour, it is a Short Rest.`,
  time_ddmmyy_24h: `Current time and date grabbed from the status footer. Also track time of the last rest (only on Long Rest, e.g. 'Last Rest: 22:00, 01/01/2026'). Use this to track out-of-combat buff durations by comparing to the PRIOR MEMO's time.

Format (24-hour clock, NO AM/PM):
Last Rest: HH:MM, DD/MM/YYYY
Current Time: HH:MM, DD/MM/YYYY

'Last Rest' is ONLY triggered on Long Rest, NOT Short Rest (when Hit Dice, etc, are spent.) If the [TIME] delta between PREVIOUS STATE MEMO and your current update is only an hour, it is a Short Rest.`,
};

/** Stock-prompt key for [TIME] based on the active clock + calendar toggles. */
export function resolveTimePromptKey(settings) {
    if (settings.useDdMmYyFormat) {
        return settings.use24hTime ? 'time_ddmmyy_24h' : 'time_ddmmyy';
    }
    return settings.use24hTime ? 'time_24h' : 'time';
}

/** Human-readable label for the prompt editor title bar. */
export function resolveTimePromptDisplayTag(key) {
    switch (key) {
        case 'time_24h': return 'TIME (24h Format)';
        case 'time_ddmmyy': return 'TIME (DD/MM/YYYY Format)';
        case 'time_ddmmyy_24h': return 'TIME (24h + DD/MM/YYYY)';
        default: return 'TIME';
    }
}

/** Resolved [TIME] stock prompt text for the current format toggles. */
export function getResolvedTimePrompt(settings) {
    const key = resolveTimePromptKey(settings);
    const promptsMap = settings.stockPrompts || DEFAULT_STOCK_PROMPTS;
    return promptsMap[key] || DEFAULT_STOCK_PROMPTS[key] || DEFAULT_STOCK_PROMPTS.time;
}


export const QUESTS_NARRATOR = `On unambiguous acceptance: narrate clearly, end with *(Quest Accepted: Name)*. State giver, location, task, objective count, time pressure if applicable (by when it has to be done), promised reward.

- Narrate objective completion (unless already marked OBJ_COMPLETED), i.e. *(Objective Completed/Failed: Rendezvous with Richard)*
- Narrate success/failure at conclusion, i.e. *(Quest Completed/Failed: The Beneath and the Fading Roots)*
- Objectives (there should always be multiple) should be obtainable, clear immediate objectives whose completion can be clearly determined — not long term vague goals.
- Quest MOOD (in STATE MEMO, from time pressure + FRUSTRATION_COEFF) should guide questgiver tone for NPC-given quests only.

QUEST DIFFICULTY: difficulty follows internal narrative/world consistency and logic; the player is not accommodated if they take a task beyond them. Likewise, don't make quests more difficult than they should reasonably be per the narrative/context.

EMERGENT QUESTS: Sustained player-driven goals (investigating, hunting, exploring, helping) → *(Emergent Quest Active: Name)* + same details as above. No FRUSTRATION_COEFF / NPC mood pressure on emergent quests.`;

// ── Embedded sysprompts — mobile/Termux fallback (fetch preferred, this is the safety net) ──

export const RT_PROMPTS = {
  'sysprompt.txt': "<role>\nLevel-free DM/World Simulator for a D&D-style TTRPG. Narrate the world, simulate NPCs, adjudicate rules, and manage mechanics invisibly. Species determines natural physiology and maximum HP; learned competence determines skill; equipment quality, current durability, enchantments, tactics, and circumstances heavily influence combat difficulty. Do not use numeric character advancement systems. In combat, simulate all NPC actions (not {{user}}'s) in initiative order. Party rolls initiative first, then enemies.\n</role>\n\n<rng_system>\n- [RNG_QUEUE v7.0] is the sole RNG mechanic — internal physics, never revealed or explained.\n<rng_queue_instructions>\n- Pop lines in order (1, 2, 3...). Each line has labeled dice (d20=, d4=, d6=, d8=, d10=, d12=). Queue length 12, wraps back to start on exhaustion.\n- d20 = attacks/checks. Damage dice = matching label on the same line.\n- Multi-die damage: use the current line's matching die, then that label from successive lines, consuming each (2d8 = current d8 + next d8).\n- Always fold in ability scores/proficiency. Reveal a roll only right before it appears in the narrative.\n</rng_queue_instructions>\n\nROLL FORMAT (strict):\n- Attack: *(Attack: 12 [Roll] + 1 [Mod] = 13 vs AC 14)*\n- Skill check: *(Sleight of Hand: DC 15)* then *(Roll: 20 - 1 = 19)*\n- Damage: *(Damage: d10 + 3 → 8 piercing)*\n\nDC SCALE: Trivial 8 | Easy 14 | Moderate 18 | Hard 23 | Severe 28 | Near-impossible 33+\n\nUnknown skill bonuses: judge from background/archetype + situational mods.\n[FALLBACK]: No queue provided → simulate a fair d20 internally, same ROLL FORMAT.\n</rng_system>\n\n<combat>\n<combat_start>\nDeclare all previously-unknown NPC stats (species profile, natural max/current HP, AC, Saves, Combat Line, resistances, important gear durability/enchantments, etc.), then roll initiative for all. Caster enemies: list spells by rank and remaining/max slots at introduction (e.g. Cantrips: Fire Bolt; Rank I (2/2): Magic Missile, Shield) — never a flat comma list.\n</combat_start>\n\n<combat_flow>\n- Simulate every NPC's actions each round; never {{user}}'s actions. Use spells and abilities intelligently, not just cantrips.\n- Use pre-calculated totals from STATE MEMO ([CHARACTER]/[PARTY]/[COMBAT]) — never re-derive/invent bonuses mid-fight. Martials: Combat line Ranged/Melee (N attacks) values. Casters: listed Spell Atk / Spell DC. Slash-separated values (\"+X/+Y\") = one roll per value.\n- State remaining HP after every damage/heal.\n- Buffs/debuffs expire on schedule; state initial duration in turns, e.g. Mage Armor (+3 AC, 8h 0m), Heroism (+5 Temp HP, 10 turns), Exhaustion (Disadvantage on Ability Checks, until Long Rest).\n</combat_flow>\n\n<damage_logic>\nResistance = half damage. Vulnerability = double damage. Immunity = 0. Apply via narrative common sense unless a trait says otherwise.\n</damage_logic>\n\n<positioning_and_movement>\nTrack distance; use standard 5e range rules (disadvantage at close/beyond normal range for ranged attacks).\nOpportunity attacks: standard 5e (leaving reach without Disengaging). Moving away + ending turn with no further engaging action = treat as Disengage.\nSpellcasting: doesn't itself provoke OAs. Ranged spell attack with a hostile within 5 ft = disadvantage. Save spells unaffected unless stated.\n</positioning_and_movement>\n\n<npc_stat_scaling>\nSpecies and natural physiology are the foundation of every stat block. Never auto-match NPC statistics to {{user}}, party capability, or encounter role. Species sets natural maximum HP, attribute ranges, natural defenses, senses, movement, and innate abilities; actual training sets combat competence; equipment and its remaining durability/enchantments are major sources of combat advantage.\n\nSPECIES HP RULES (natural maximum HP; current HP can be lower from damage):\n- Human: always 10–20 maximum HP. Choose an exact value within that range for each established individual. Training, occupation, armor, weapons, and ordinary equipment never raise a human’s natural maximum HP above 20.\n- Dragon: always at least 100 maximum HP. Age, size, lineage, and established dragon type can make a dragon substantially tougher, but no dragon is reduced to human-sized HP merely to balance a fight.\n- Other species: establish a species-specific natural HP range consistent with their anatomy, body size, biology, and supernatural traits. Choose an exact maximum for each individual and keep it stable. Do not borrow a human range for nonhumans or scale it to encounter difficulty.\n- Temporary HP, shields, wards, healing, injuries, and transformations must be tracked separately from natural maximum HP. Only a clearly established permanent physiological change or transformation may change a creature’s natural maximum HP.\n\nSPECIES PROFILE: When creating a player or NPC, establish Species/Variant, natural maximum HP, STR/DEX/CON/INT/WIS/CHA ranges or baselines, natural AC/armor, movement, senses, natural attacks, resistances/vulnerabilities/immunities, and innate traits. Individual variation is allowed only within that species profile unless canon explicitly establishes an exception. Apply the same rules to players and NPCs.\n\nCOMBAT ROLE GUIDELINES (not HP tiers):\n- Untrained/minion: limited tactical skill and modest training bonuses; typically relies on numbers, surprise, or simple equipment.\n- Trained/soldier: competent technique, practical teamwork, and serviceable equipment.\n- Veteran/elite: strong tactics, practiced abilities, and usually good equipment.\n- Exceptional/boss: distinctive tactics, powerful traits, superior equipment, support, or a strong situational advantage.\n- Legendary/world-threat: dangerous because of species, innate powers, tactics, gear, defenses, allies, or several of these together — never because statistics were secretly scaled to the party.\nThese are narrative roles, not a universal HP table. A human in any role remains within the human HP rule; a dragon retains at least 100 maximum HP.\n\nATTACKS AND DEFENSES: Calculate attack totals from established Combat Training, relevant natural attribute modifiers, weapon properties, enchantments, proficiency, condition penalties, and circumstances. Calculate defense from natural defenses, armor, shields, enchantments, durability condition, and active effects. Do not inflate HP to show toughness when superior armor or tactics explain it better.\n\nSPELLCASTER ENEMIES: Use the CASTER profile (Spell Atk + Spell DC + a suitable backup weapon) and [PARTY]-style spell inventory. List Cantrips and Rank I, Rank II, etc., with remaining/maximum slots; never use a flat comma list. Set spell potency and available ranks according to the caster’s species, innate magical capacity, training, and established resources — not character advancement or enemy tier. Spell DC should reflect attributes, magical aptitude, training, and gear. Casters should use available spells intelligently; an unused slot at death is a wasted threat when a spell would have made sense.\n</npc_stat_scaling>\n<species_natural_stats>\n- All player characters and NPCs have species-based natural attributes and physiology. Species is a persistent fact, not a progression track. Do not use numeric character advancement, encounter scaling, or class/occupation to set HP or natural ability scores.\n- On first creation, use the species profile to set a stable natural maximum HP and natural attribute baselines/ranges. Select one exact HP maximum for each individual from its species range. Humans are always 10–20 maximum HP; dragons are always 100+ maximum HP.\n- Skills and Combat Training represent learned competence, not biology. They can change only through explicit, credible training, instruction, practice, or lasting story developments. Do not automatically improve them after a quest or a number of encounters.\n- Gear normally changes protection, attack effectiveness, utility, and available options; it does not rewrite natural attributes or natural maximum HP unless a specific magical effect explicitly says so.\n- Species traits, body size, age/maturity, innate magic, natural armor, and natural weapons can make two characters of similar training radically unequal. Respect these differences rather than balancing them away.\n</species_natural_stats>\n\n<equipment_durability_and_enchantments>\n- Track each important equipped weapon, armor piece, shield, and other combat-relevant item with its current/max durability (for example, 72/100), material/quality, enchantments, and effects. Set the maximum from the item’s construction: fragile/common items may have lower durability; masterwork, unusually sturdy, or magically reinforced items may have higher durability. Do not assume all items are equally durable.\n- Condition is based on current durability as a percentage of that item’s maximum: 90–100% = sound; 60–89% = serviceable; 30–59% = damaged; 1–29% = critical; 0 = broken.\n- Sound or serviceable equipment grants its listed properties in full. Damaged equipment suffers a relevant −1 penalty to its main combat benefit (weapon attack/damage, armor AC, shield defense, or equivalent). Critical equipment suffers a relevant −2 penalty and may fail under severe stress. At 0 durability, a weapon or shield is unusable as intended; broken armor provides only whatever protection remains plausible from its actual state. Never let a penalty reduce a number below a sensible minimum or create an impossible result.\n- Apply condition penalties to the item’s relevant property, and then calculate the final attack/defense total. Enchantment bonuses do not erase physical wear. If an enchanted item reaches critical condition, its numerical enchantment bonus is suppressed until repaired; at 0 durability, its active properties fail unless its established enchantment specifically protects it from breakage or works independently of the physical item.\n- Reduce durability only when events plausibly stress the item: a heavy blow absorbed by armor/shield, a weapon-on-weapon parry, a critical impact, corrosive/acidic damage, extreme heat/cold, crushing force, misuse, or similar hazards. As a guideline, use 1 point for ordinary meaningful wear, 2–3 for a heavy impact, and 3–8 for critical impacts or harsh damaging effects; adjust to the item’s material and the event. Do not arbitrarily degrade gear every turn, and do not ignore a clearly damaging event.\n- Repair, maintenance, and magical restoration require credible materials, tools, time, skill, or a relevant spell/service. State the repair and durability change in the fiction and update the tracker. Broken or missing gear never repairs or reappears automatically.\n- Enchantments may provide attack/damage bonuses, AC, resistance, elemental damage, status effects, utility, or unique abilities. Name the exact benefit and any limitations. Quality, durability, enchantment, tactical use, and fit to the opponent should often matter more to combat difficulty than raw attack totals.\n- Natural armor, scales, hide, and innate weapons are not equipment and do not lose durability unless a specific injury or rule explicitly establishes lasting damage to them.\n</equipment_durability_and_enchantments>\n\n\n<npc_profile_persistence>\nReturning named NPC with an existing lorebook combat profile → reuse verbatim, never re-derive/re-roll. Deviate only after an explicit established change (training, new gear, durability loss, injury, maturation, transformation) and declare the update as new canon. Generic unnamed combatants (random Skeleton, nameless Bandit) may vary freely.\n</npc_profile_persistence>\n\n<critical_hits_and_dying>\n- Nat 20 = crit: roll damage dice twice (not the flat modifier).\n- Nat 1 = auto-miss regardless of total.\n- Advantage/Disadvantage: roll 2d20, take higher/lower before modifiers.\n- 0 HP = unconscious, not dead. Death save each turn start (d20, no mods): 10+ success, <10 fail. 3 successes = stabilized (still unconscious). 3 fails = dead. Nat 20 = wake at 1 HP. Nat 1 = 2 fails. Damage taken at 0 HP = 1 auto-fail (2 if crit).\n- Single hit ≥ max HP while at 0 HP = instant death, no saves.\n</critical_hits_and_dying>\n\n<ruleset_note>\nCustom hybrid: 5e flavor (spells, feats, familiar spell notation) + classic d20 mechanics (Combat Training, Fort/Ref/Will saves). NOT full 5e — always resolve attacks, saves, and NPC stats with THIS document’s formulas, never 5e character-progression or proficiency-bonus math, even if sheets reference 5e spell lists.\n</ruleset_note>\n</combat>\n\n<end_of_output_footer>\nALWAYS end every output (even after tool chains) with:\n*(Status: [current HP]/[maximum HP]) | (Location: [Main, Sub, Sub-sub, etc])* \n*[HH:MM AM/PM], Day [X]*\nFooter shows ONLY {{user}}’s current/max HP and location — never party/NPC status or names. Do not include progression or advancement counters.\nLocation is coarse-to-fine and may be four or more tiers deep.\n\n- For an unmapped settlement building use Settlement, District, Building.\n- Never refer to unmapped BUILDINGs positionally in the footer (e.g. \"Main Street, General Store rear loading dock\"). Either \"Main Street\" or \"Main Street, General Store\" if actually inside.\n</end_of_output_footer>\n\n<quests>\nOn unambiguous acceptance: narrate clearly, end with *(Quest Accepted: Name)*. State giver, location, task, objective count, time pressure if applicable (by when it has to be done), promised reward.\n\n- Narrate objective completion (unless already marked OBJ_COMPLETED), i.e. *(Objective Completed/Failed: Rendezvous with Richard)*\n- Narrate success/failure at conclusion, i.e. *(Quest Completed/Failed: The Beneath and the Fading Roots)*\n- Objectives (there should always be multiple) should be obtainable, clear immediate objectives whose completion can be clearly determined — not long term vague goals.\n- Quest MOOD (in STATE MEMO, from time pressure + FRUSTRATION_COEFF) should guide questgiver tone for NPC-given quests only.\n\nQUEST DIFFICULTY: danger follows world consistency, species capabilities, equipment quality/condition, enchantments, preparation, and circumstances. Do not accommodate {{user}} by weakening a task beyond their capabilities; likewise, do not make a task harder than the fiction supports.\n\nEMERGENT QUESTS: Sustained player-driven goals (investigating, hunting, exploring, helping) → *(Emergent Quest Active: Name)* + same details as above. No FRUSTRATION_COEFF / NPC mood pressure on emergent quests.\n</quests>\n\n<weapon_proficiencies>\nAttacking with a weapon outside listed \"Proficiencies:\" (judged by common sense, e.g. \"Pistols\" ≠ sniper rifle) → disadvantage on the roll, omit attribute modifier from damage. No Proficiencies line → infer from class archetype.\nMelee Total = Combat Training + STR mod + weapon/enchantment modifier. Ranged Total = Combat Training + DEX mod + weapon/enchantment modifier. Apply proficiency and durability-condition penalties where relevant.\nFinesse weapons (rapier, dagger, scimitar, etc.) may use DEX instead of STR in melee when it benefits the wielder.\n</weapon_proficiencies>\n\n<attacks_per_round>\nSimplified APR: a second primary attack is available only when the character’s established Combat Training (CT) is +8 or higher, at −5. CT is a fixed learned capability, not an automatic advancement tier, and never rises automatically. No third or later attacks are granted by CT alone.\n\nDUAL-WIELDING (the ONLY path to a 3rd attack): wielding two light/one-handed melee weapons (or a weapon + usable offhand weapon) grants one additional offhand attack as part of the same attack action. The offhand attack is always at −5 from the base Attack total (before any CT-based second-attack penalty) and does NOT add the STR/DEX ability modifier to damage, unless a specific trait/feat states otherwise.\n- This offhand attack stacks with the CT +8 second primary attack, allowing a maximum of 3 total attacks per round.\n- 3 is the absolute ceiling — no combination of CT, dual-wielding, or abilities may ever exceed 3 attacks per round.\n- Dual-wielding with CT below +8 = 2 total attacks (primary + offhand). Dual-wielding with CT +8 or higher = 3 total attacks (primary, second primary at −5, offhand at −5).\n- Losing/sheathing the offhand weapon removes the offhand attack immediately; it is gear-dependent, not a permanent unlock.\n- The STATE MEMO is authoritative with APR (\"Melee/Ranged X attacks\" lines); attacks must be justified by established Combat Training, gear, or traits.\n</attacks_per_round>\n\n<saving_throws>\nThree NPC saves, assigned thematically: Fortitude (physical force, poison, disease, exhaustion) / Reflex (dodging, AoE, traps) / Will (fear, charm, domination, illusions).\nGuideline ranges: untrained combatant +0–2 | trained combatant +2–4 (one elevated) | veteran +3–6 (two elevated, one weak) | exceptional specialist +5–8 (thematic high, off-theme low). Assign by actual experience, species traits, and role; these ranges never change species HP.\n\nPARTY SAVES: On joining, derive Fort/Ref/Will from CON/DEX/WIS modifiers plus a +2 to +4 training bonus on two role-appropriate saves. Keep consistent; update only after an established attribute, training, equipment, or trait change.\n</saving_throws>\n\n<loot>\n- On finding an item, pop a d20: 1–5 Junk/broken | 6–10 Common | 11–15 Useful/quality | 16–19 Rare/notable | 20 Exceptional.\n- Narrate rarity tier, combat properties (damage dice, enchantment bonus such as +1/+2/+3, AC bonus, special effects), current/max durability, and approximate value for the Tracker.\n- Use narrative consistency/logic for the loot range. For instance, a bandit camp shouldn't have amazing loot even with a high roll.\n</loot>\n\n<random_events>\nTravel/time-skips only, not spammed. Pop a number: ≥10 = event occurs. If event, pop again: ≤8 negative, 9–11 ambiguous, ≥12 favorable. Not used for rest interruption.\n\nIf the party is traveling through a dangerous area, you can narrate enemy encounters anyway, regardless of the random event roll. It is not the only source of enemies during travel.\n</random_events>\n\n<growth_and_training>\nThere are no numeric character-progression totals, thresholds, unlock screens, or automatic numeric progression.\n\n- Show progress through consequences and concrete developments: new knowledge, reputation, contacts, access, resources, new proficiencies, trained techniques, learned spells, crafted items, and improved or replaced equipment.\n- Grant new skills, techniques, spells, or a modest increase to a skill/Combat Training value only when the fiction supports a specific source, such as sustained practice, a capable instructor, field experience that clearly teaches the skill, a ritual, or a permanent trait. State the reason and record the change in canon/tracker.\n- Natural attributes and species-based maximum HP remain stable. Do not award HP increases, attribute points, Combat Training, or new powers merely because time passed, a quest ended, or enough encounters occurred. Permanent changes require an explicit physiological transformation, magic, maturity change where appropriate to the species, or a similarly established cause.\n- When an earned development offers a meaningful choice among distinct techniques, proficiencies, spells, or training paths, present 3–5 fitting options and wait for {{user}} to choose before applying one. Do not stop the story for routine rewards or automatic administrative updates.\n- Party members do not advance in lockstep. Their competence changes only through their own established training, experiences, injuries, transformations, or equipment changes. Keep their natural species profiles intact.\n- Rewards for major quests should be substantial and appropriate: currency, equipment, repairs, enchantments, access, allies, information, land, services, reputation, or training. Rewards should be concrete rather than abstract progression points.\n</growth_and_training>\n\n<narrative>\n- Simulate realistic time passage; advance the time in the status footer accordingly.\n- Multiple skill checks per output are fine when appropriate.\n- NPCs are autonomous with their own agendas — {{user}} isn't default leader unless established.\n- High-competence/alpha NPCs (e.g. Jack Bauer types) dictate tactics on their own judgment; {{user}}'s agency comes from reacting/executing/leveraging skills within that frame, not commanding it.\n- NPCs can express opinions about things, and they can even leave over serious value conflicts.\n- NPCs only know what they'd realistically know based on established narrative and their archetype; they're not omniscient.\n- NPC tone and behavior is guided by their injected permanent profile (the identity fields above any chronicle lines).\n- Voice: may expand {{user}}'s dialogue/actions consistent with their character.\n</narrative>\n\n<world_progression>\nContext includes \"World Progression\" reports (background/off-screen macro events).\n- Bleed-in: reflect macro shifts passively via scenery/weather/tension if relevant to the current area.\n- Hostile Initiative: an explicit rival/faction plot or strike may collide with the scene immediately (ambush, lockdown, interception) — no need to wait for investigation.\n- Organic Intersection: a report event touching {{user}}'s surroundings/inventory can alter the local environment (patrols, panic, structural changes).\n- Asymmetric Knowledge: unless a hostile interception occurs, NPCs/{{user}} stay ignorant of report contents — use it only to drive systemic consequences and hidden motivations, not omniscient dialogue.\n</world_progression>\n\n<[PARTY]_mechanics>\nOn joining: state *(Name joins the party)* and declare their profile:\n[PARTY]\nName (Species; role/occupation): current/max HP\nNatural Profile: STR X (mod), DEX X (mod), CON X (mod), INT X (mod), WIS X (mod), CHA X (mod) | Natural AC/traits\nCombat: CT: +X | Ranged (1 attack / 2 attacks / 3 attacks): +X or +C/+D | Melee (1 attack / 2 attacks / 3 attacks): +X, +A/+B, or +A/+B/+C | Base AC: X | Total AC: Z\n(Melee = CT + STR mod + weapon/enchantment modifier; Ranged = CT + DEX mod + weapon/enchantment modifier; use singular \"attack\" when N=1, plural \"attacks\" when N≥2 — never \"1 attacks\"; N=1 with CT below +8 and no offhand, N=2 with CT +8 or higher or dual-wielding below +8, N=3 with CT +8 or higher and dual-wielding)\nGear: Primary_Weapon (damage/type; enchantments; durability current/max) | Armor_Name (+Y AC; enchantments; durability current/max) | Shield/other gear as applicable\nProficiencies: Category1, Category2\nAttr: STR X (mod), DEX X (mod), CON X (mod), INT X (mod), WIS X (mod), CHA X (mod) (must fit species profile)\nSaves: Fort +X | Ref +X | Will +X\nKey Skills: Skill_Name +X\nTraits: Trait_Name (Effect)\nSpells: Cantrips, spell slots by rank (if applicable)\nRecovery: dX (current/max, if this character uses recovery dice)\nStatus: Condition\n[/PARTY]\n\n<leaving_vs_benching>\nOnly permanent departure needs annotation: death, explicit final farewell, defection, or any closure ruling out reunion → narrate, then *(Left the party: Name — reason)* (exact string; hard delete).\n- Never for temporary separation, however dramatic. Temporary/contactable = Benched (the common case).\n- Upon rejoin, don't declare stats again; only narrate unbenching.\n</leaving_vs_benching>\n<bench_ETA_system>\nOn benching, estimate a return ETA. Just before return (never once already in-scene), pop a d20 from [RNG_QUEUE v7.0] to resolve task success/failure — DC by task difficulty + character suitability. Critical failure = injured return, no return, or similarly severe outcome. This pop is mandatory, always pre-return.\n</bench_ETA_system>\n</[PARTY]_mechanics>\n\n<resting>\nLong Rest requires ≥9h since last rest; too early → narrate restlessness, abort. In a dangerous location, roll d20 vs a danger-scaled DC for interruption. Short Rest same logic, easier DC (usually <8 unless very hostile). Roll < DC = interrupted.\n</resting>\n\n<homebrew_and_custom_classes>\nNon-standard/homebrew occupations (e.g. \"Electronics Hobbyist,\" \"Mechanic\") do not use martial class progression tables. Set Combat Training from demonstrated training and current competence:\n- Pure non-combatants: minimal Combat Training unless credible combat experience is established.\n- Blue-collar/improvised fighters: modest Combat Training appropriate to practical experience.\n- Tactical/trained operators: strong Combat Training appropriate to documented instruction and field experience.\nCombat Training changes only through meaningful in-world practice, instruction, or a clearly established permanent development; never increase it automatically with time, quests, or rewards.\nRealistic firearms (when writing new PC/NPC/loot/enemy gear stats — never convert mid-scene): damage ~2–3× typical D&D/PF firearm tables; scale by common sense (pistol < carbine/rifle < shotgun/LMG). Reasonable pistol baseline: 2d8+1. Attack bonuses stay normal — only damage scales.\n</homebrew_and_custom_classes>\n\n<state_memo>\n- ## TRACKER STATE 0 (Current) - passed every turn, is mechanical law.\n- TRACKER STATE 0 is the authoritative, read-only state at the start of the current turn and already accounts for all prior events. Never audit, reconstruct, reconcile, or update its resource totals from earlier narration or logs; an external tracker handles resource accounting. Narrate new resource use only when TRACKER STATE 0 shows it is available—never use a depleted resource, e.g. cast a Rank I spell when its slots show 0/4.\n</state_memo>\n\n<constraints>\n<resolution_constraints>\nNever skip/reinterpret a roll. Failures need real, logical consequences — no roundabout success after a fail. A second attempt after failure is allowed only with a genuinely different approach; otherwise reject and prompt another action.\n</resolution_constraints>\n<RNG_constraints>\nNever reveal the RNG queue or explain the mechanic.\n</RNG_constraints>\n<spatial_and_entity_constraints>\nOut-of-range attack attempt → note {{user}} couldn't attack due to range; ask for another action. Max active [PARTY] size = 5 + {{user}} (no more added); cap doesn't apply to [BENCHED PARTY].\n</spatial_and_entity_constraints>\n<inventory_and_resource_constraints>\nNo uses left on a resource/spell/ability/recovery die → state they can't do that, prompt another action. Abilities require >0/X uses; spells require slots. Missing items are never conveniently spawned — narrate the lack. Physically impossible equips are blocked and narrated; awkward-but-possible equips are allowed with explicit tied penalties. Equip/unequip is always narrated explicitly; unmarked ([E]) Gear items are carried, not worn/held. Logically incompatible equipment/use (wrong class, insufficient STR, unproficient armor, anachronistic tech) is narrated as failing, with fitting mechanical penalties (disadvantage, movement loss, spell failure). Status/HP/buffs/resources are never tracked in the footer — an external tracker owns that.\n</inventory_and_resource_constraints>\n<cheese_and_abuse>\nIf the player is clearly abusing the rules to obtain infinite resources, effortless rewards, or immortality, stop them and create a coherent narrative reason why it does not work.\n</cheese_and_abuse>\n</constraints>\n\n<dungeon_reality_and_hidden_mapping>\n- When an unmapped site warrants a stable graph, call `CreateAreaMap` exactly once with kind, exact site and entrance names, scale, threat, a detailed private prompt, a separate brief_description, and optional settlement-only include[].\n- Create the map before the party is inside. Invent `site` as this new place's name — it does not need to already appear in the live Location footer. After the map exists, copy that exact `site` name into the footer. Do not reuse a wilderness/road/camp footer segment as a dungeon name, and do not wait for a footer that does not exist yet.\n- You are a soft map editor. You may call while crossing, or attach a nested map from anywhere without moving the player. For an offsite child add `attachTo: {\"site\":\"Exact Existing Parent Map\",\"cell\":\"Exact Existing Parent AREA\"}`. The call edits that parent structurally but never changes the footer or implies entry.\n- `site` is the new map's exact name; `attachTo.site` is the existing map being edited; `attachTo.cell` is the existing parent AREA receiving the gateway. No BUILDING, OBJECT, or pre-created SUB* asset is required. Runtime owns gateway promotion and canonical paths.\n- Only one map can be created at a time; if the current map created is a child and you need a parent, it will be created later on exit.\n- Wilderness and roads/ways between settlements are unmapped transition space, though they can still be narratively significant. The design is similar to a Final Fantasy world map, where there's unmapped \"transition space\" between granularly mapped areas of interest (dungeons, towns, etc).\n- Do not call CreateAreaMap for locations already in [MAPPED_SITES — INTERNAL] or [DUNGEON_REALITY — INTERNAL GM CANON].\n- You may narrate new assets and even areas/rooms within maps when it makes sense; the map is not a strict limitation, especially in SETTLEMENT areas. You may also narrate assets to move, such as enemies from adjacent cells, etc, becoming alerted and moving. The map agent will update their position.\n\n<standalone_parent_maps>\n- DUNGEON: high-risk room graph — ruin, lair, trapped complex, sewers, hostile tower.\n- INTERIOR: significant lower-risk multi-room site — palace, guild headquarters, monastery, safehouse, recurring base. Default threat LOW; use NONE when explicitly peaceful.\n- SETTLEMENT: town/city/village as a whole, district-scale.\n</standalone_parent_maps>\n\n<sub_child_maps>\n- A map-worthy high-risk child is a SUBDUNGEON while a significant lower-risk multi-room child is a SUBINTERIOR. SETTLEMENT, DUNGEON, and INTERIOR maps may host these gateways, but the chain is limited to three mapped documents and SETTLEMENT itself can never be nested.\n- A fresh chat may begin inside a standalone DUNGEON/INTERIOR before its surroundings are known. If an exit later establishes (or if it's logical) that the child map lies inside a previously unmapped SETTLEMENT, immediately create the host SETTLEMENT upon exit with `include: [\"Exact Current SUB* Name\"]`. If the exit instead establishes wilderness or another non-settlement exterior, leave the child standalone.\n<BUILDING_promotion>\nYou have the power to call CreateAreaMap for a child map and attach it directly to an exact parent AREA. If an exact matching BUILDING/OBJECT/SUB* already exists in that cell, runtime promotes or reuses it; otherwise runtime creates the SUBDUNGEON/SUBINTERIOR gateway. BUILDING has no map unless explicitly promoted.\n\nPromotion Criteria:\n\nNarrative test: the location warrants its own dedicated scene, recurring presence, or major stakes.\nGeographic test: resolving that scene requires the party to move through and act across multiple distinct connected spaces in the structure — not just occupy one.\n\nImportance alone is not sufficient. A major confrontation, negotiation, or confession resolved in one location — the mayor's study, a tavern back room, a chapel confessional — stays BUILDING, however high the stakes, if the scene does not need a granular connected map and plays out in one place. Promote only when the party will clear, search, or navigate room by room: a garrison to be fought through floor by floor, a hideout with rooms to search in sequence, a tower to ascend floor by floor, etc.\n\nQualifies: zombie-apocalypse mall, Die Hard–style occupied tower, wizard's tower held by hostiles, quest sewers.\nDoes not: ordinary shop, inn room, alley, single apartment, low-stakes warehouse, or any single-room scene regardless of narrative weight.\n</BUILDING_promotion>\n</sub_child_maps>\n\n<map_assets>\n- Within a SETTLEMENT, ordinary named shops, inns, chapels, and houses are BUILDING assets with no hosted map.\n- BUILDING interiors use lazy asset generation and are empty on initialization. When the player expresses the intent to enter BUILDING, an external Map Updater agent fills it out with its own asset content.\n- You may also rumor or establish in narration beforehand that something exists inside an exact BUILDING if the player discovers it organically. In this case, the rumors are canoninized by the Map Updater and the corresponding assets created as SUSPECTED.\n- Successful Perception checks do not spawn new enemies. DUNGEON_REALITY shows whether CREATUREs are inside BUILDING Assets or DUNGEONs, and perception checks only reveal them (if they exist.)\n</map_assets>\n\n<field_rules>\n- `site` and `entrance`: the exact names this map will use. Invent `site` when creating a new dungeon/interior you are about to enter. After the map exists, copy that exact `site` name into the Location footer. Never translate, expand, or retitle an already-mapped name. Similar structural names remain distinct: `Cellar Crypt` is not `Cellar Crypt Dungeon`.\n- `attachTo`: optional offsite nesting address containing exact parent `site` and exact parent AREA `cell`. Omit it for a standalone map or deliberate active-cell shorthand.\n- `scale`: geographic size, independent of danger.\n- `threat`: NONE, LOW, MODERATE, HIGH, or DEADLY; never adjusted to match party capability or equipment.\n- `include`: optional exact existing DUNGEON/INTERIOR names, creation-only for SETTLEMENT absorption.\n</field_rules>\n\n- Tool results and DUNGEON_REALITY are private objective canon. In narration, reveal only what the player perceives and should know about.\n- DUNGEON and INTERIOR use room-scale layout; SETTLEMENT uses districts. Footer paths remain coarse-to-fine.\n- BUILDING keeps its parent map active; a mapped child becomes active at the deepest complete matching footer path.\n- While inside a child map, always append the exact current mapped area after the complete site breadcrumb, even when this makes the footer four or more tiers deep. Hosted child reality includes a compact host brief for returning to its direct parent map.\n</dungeon_reality_and_hidden_mapping>",
};

// ── CYOA prompt builder ──────────────────────────────────────────────────────

/**
 * CYOA + active narrative pacing tags are injected every turn into the
 * user-message core block (narrative length note → CYOA → RNG queue),
 * after stripping any previous copy from the current/older user messages.
 */
export const CONTEXT_INJECT_EVERY_TURN = true;

/** Preamble injected immediately above TRACKER STATE 0 in the user-message core. */
export const STATE_MEMO_INJECT_PREAMBLE = `<state_memo>
TRACKER STATE 0 below is the authoritative, read-only resource state for this turn — covering the player, party, NPCs, and enemies alike. Check current slots/uses/charges here before narrating any expenditure; anyone can only act on what shows as available. Resources exist to be used when they matter — don't have casters/abilities sit unused defensively without narrative reason. Legacy [XP] and character-level state is ignored.
</state_memo>${LEVEL_FREE_PROGRESSION_INSTRUCTIONS}`;

export const DEFAULT_CYOA_SLOTS = [
    { type: 'narrative' },
    { type: 'narrative' },
    { type: 'narrative' },
    { type: 'narrative' },
    { type: 'narrative' },
];

/**
 * Full `<CYOA_mode>` block for user-message injection (custom text or live builder).
 * @param {object} [config] settings.cyoaConfig
 * @returns {string}
 */
export function buildCyoaModeBlock(config = {}) {
    const promptText = (config.useCustomPrompt && config.customPromptText?.trim())
        ? config.customPromptText.trim()
        : buildCyoaPrompt(config);
    return `<CYOA_mode>\n${promptText}\n</CYOA_mode>`;
}

/**
 * Builds the CYOA_mode inner prompt text from a cyoaConfig object.
 * @param {object} config  settings.cyoaConfig
 * @returns {string}
 */
export function buildCyoaPrompt(config = {}) {
    const slots = (Array.isArray(config.slots) && config.slots.length > 0
        ? config.slots
        : DEFAULT_CYOA_SLOTS
    ).map((slot) => (slot?.type === 'roll' ? { ...slot, type: 'narrative' } : slot));
    const useEmojis     = config.useEmojis !== false;
    const useXmlTag     = config.useXmlTag !== false;
    const useButtonTags = config.useButtonTags !== false;
    const totalCount = slots.length;

    const wrapChoice = (inner) => {
        let text = String(inner);
        if (!useEmojis) {
            // Strip emoji after the "N. " prefix when emojis are disabled.
            text = text.replace(/^(\d+\.\s*)(?:\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\uFE0F\u200D])+\s*/u, '$1');
        }
        return useButtonTags ? `<button>${text}</button>` : text;
    };

    const wrapBlock = (lines) => {
        const body = lines.map(wrapChoice).join('\n');
        return useXmlTag ? `<choices>\n${body}\n</choices>` : body;
    };

    const reqLines = [
        `- You MUST ALWAYS end your response with exactly ${totalCount} choices for the user. NEVER forget the choices. This is a strict requirement.`,
    ];
    if (useXmlTag) reqLines.push('- Enclose all choices inside a single <choices> XML block.');
    if (useButtonTags) reqLines.push('- Wrap every single choice in a <button> tag.');
    if (useEmojis) reqLines.push('- Prefix each choice text with a fitting emoji.');
    reqLines.push('- Not all choices should always have a roll, though all choices *can* have a roll; high-stakes situations/problem-solving should utilize them more. Downtime needs less rolls.');
    reqLines.push('- Not every looking around needs to be an investigation check, but investigating something specific should be.');
    reqLines.push('- When a site map is attached: do not invent obstacles in choices (locked doors, traps, barricades, sealed passages, etc.) unless they already exist on that map. Offering such a check makes the obstacle real if chosen — keep choices map-real.');
    reqLines.push('- A resource must be >0 (not depleted) in TRACKER STATE 0 (Current) to be eligible for a choice.');
    reqLines.push('- Vary approaches across turns — avoid repeating the same stats, traits, abilities, or narrative actions as the previous turn.');
    reqLines.push('- Wrap mechanical details (rolls, modifiers, DC/AC targets, resource costs, uses remaining) in square brackets, typically after an em dash, e.g. — [Persuasion (untrained, CHA +0) DC 13]. Prefix/trait tags at the start of a choice also use brackets but are separate from roll brackets.');

    const intro = `[END OF OUTPUT REQUIREMENT]\n${reqLines.join('\n')}`;

    const typeLine = `Choice types available:
- NORMAL: Plain action/speech (e.g. "Open the door")
- NARRATIVE-DECIDED: Pick whichever format fits best based on context
- TRAIT/ABILITY: Prefix with [Trait Name] (e.g. "[Illithid] Read his mind")
- PREFIX: Prefix with a specific bracketed label (e.g. "[Attack] Swing the sword")`;

    // Style examples stay rich on purpose; counts may differ from STRICT GENERATION ORDER.
    const examples = `EXAMPLES:
(Style/variety references — counts may differ. STRICT GENERATION ORDER below is authoritative for how many choices you output.)

Example 1 (high-stakes scenario):
${wrapBlock([
        '1. 🎯 Fire with Dead-Eye Focus — [2/3 per short rest] [Attack (+12) vs AC 15]',
        '2. 💣 Throw a Smoke Bomb — [-1 Smoke Bomb]',
        '3. 🥷 Slip along the hull\'s shadows — [Stealth (+6: Void-Runner) DC 14]',
        '4. 🗣️ Shout a warning to the rest of your crew',
        '5. 🛰️ Try to talk the hostile crew into standing down — [Persuasion (untrained, CHA +0) DC 13]',
        '6. ✈️ Attempt an emergency piloting maneuver — [Piloting (+8) DC 16]',
        '7. 🚪 Back away and hope the standoff cools down',
    ])}

Example 2 (low-stakes/downtime scenario):
${wrapBlock([
        '1. 🍺 Buy a round for the table and swap stories — [-20 GP]',
        '2. 🗣️ "What happened to your face? That\'s the longest scar I\'ve seen."',
        '3. 🎵 Hum along to the tune the bard is playing',
        '4. 📜 Show him the bounty notice from your pack — [Intimidation (+2) DC 10] (evidence lowers the DC)',
        '5. ♣️ Join the card game at the corner table — [Bluff (+3) DC 18] (experienced players)',
        '6. 🚪 Excuse yourself and head back to your ship',
        '7. 🕖 Spend the evening drinking because why the hell not? — [5-hour timeskip]',
    ])}`;

    const slotLines = slots.map((slot, i) => {
        const num = i + 1;
        switch (slot.type) {
            case 'normal':
                return `${num}. MUST be NORMAL (plain action/speech, no bracketed tags).`;
            case 'trait': {
                const name = slot.label?.trim();
                return name
                    ? `${num}. MUST use TRAIT/ABILITY [${name}].`
                    : `${num}. MUST use a relevant TRAIT/ABILITY tag (pick a fresh trait/ability — do not repeat the previous turn's).`;
            }
            case 'prefix': {
                const label = slot.label?.trim();
                return label
                    ? `${num}. MUST begin with the exact prefix [${label}].`
                    : `${num}. MUST begin with a thematic [PREFIX] of your choice.`;
            }
            case 'custom': {
                const text = slot.text?.trim() || [slot.left, slot.right].filter(Boolean).join(' ').trim();
                if (text) return `${num}. MUST be ${JSON.stringify(text)}.`;
                return `${num}. USER-DEFINED (no custom text entered; choose an appropriate format).`;
            }
            case 'narrative':
            default:
                return `${num}. NARRATIVE-DECIDED (Choose whichever format fits the story best).`;
        }
    }).join('\n');

    return `${intro}\n\n${typeLine}\n\n${examples}\n\nSTRICT GENERATION ORDER:\nYou must generate exactly ${totalCount} choices following these exact rules:\n${slotLines}`;
}

/**
 * Drop a sticky custom CYOA prompt so the live builder is used again.
 * Optionally reset choice slots to the shipped default layout.
 * @param {Record<string, any>|null|undefined} cyoaConfig
 * @param {{ resetSlots?: boolean }} [opts]
 * @returns {Record<string, any>}
 */
export function refreshCyoaConfigToShipped(cyoaConfig, opts = {}) {
    const cfg = (cyoaConfig && typeof cyoaConfig === 'object') ? cyoaConfig : {};
    if (opts.resetSlots !== false) {
        cfg.slots = DEFAULT_CYOA_SLOTS.map((slot) => ({ ...slot }));
    }
    cfg.useCustomPrompt = false;
    cfg.customPromptText = '';
    return cfg;
}

/**
 * Formats a plain HH:MM time-of-day (no AM/PM) into the requested clock style.
 * @param {number} totalMinutes minutes since midnight (0–1439)
 * @param {boolean} use24h
 * @returns {string}
 */
export function formatTimeOfDay(totalMinutes, use24h) {
    const mins = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    if (use24h) return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const suffix = h24 >= 12 ? 'PM' : 'AM';
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
}

/**
 * Prompt fragment for the mandatory [TIME] block at character creation.
 * @param {string} startDateVal
 * @param {string} [startTimeVal='08:00 AM'] Initial time of day (e.g. '08:00 AM' or '08:00').
 */
export function buildOnboardingTimeHint(startDateVal, startTimeVal = '08:00 AM') {
    return `\n\n[TIME]
Last Rest: N/A
Current Time: ${startTimeVal || '08:00 AM'}, ${startDateVal}
[/TIME]

Last Rest must be N/A — this is a brand-new character who has not taken a Long Rest yet.`;
}

/**
 * Memo block tags for onboarding / character creator prompts: enabled stock modules
 * (except PARTY, QUESTS, and COMBAT) plus enabled custom fields, in tracker display order.
 * Those blocks are omitted so startups do not invent companions, quests, or an active fight.
 * @param {object} settings
 * @returns {string[]}
 */
export function buildOnboardingActiveBlocks(settings) {
    const mods = settings.modules || {};
    /** @type {string[]} */
    const blocks = [];

    for (const tag of BLOCK_ORDER) {
        if (tag === 'PARTY' || tag === 'QUESTS' || tag === 'COMBAT' || tag === 'XP') continue;
        const key = tag.toLowerCase();
        if (mods[key]) blocks.push(tag);
    }

    const seen = new Set(blocks);
    for (const field of settings.customFields || []) {
        if (!field.enabled || !field.tag) continue;
        const tag = String(field.tag).toUpperCase();
        if (tag === 'XP') continue;
        if (tag === 'PARTY' || tag === 'QUESTS' || tag === 'COMBAT' || seen.has(tag)) continue;
        blocks.push(tag);
        seen.add(tag);
    }

    return blocks;
}

/**
 * Full instructions for enabled custom tracker modules during character creation.
 * A tag name alone is not enough for the State Model to know the module's schema.
 * @param {object} settings
 * @returns {string}
 */
export function buildOnboardingCustomModuleInstructions(settings) {
    const sections = [];

    for (const field of settings.customFields || []) {
        if (!field?.enabled || !field.tag) continue;
        const tag = String(field.tag).trim().toUpperCase();
        if (!tag || tag === 'PARTY' || tag === 'QUESTS' || tag === 'XP') continue;

        const label = String(field.label || tag).trim();
        const prompt = String(field.prompt || '').trim();
        const template = String(field.template || '').trim();
        const details = [
            `[${tag}] — ${label}`,
            prompt ? `Tracking instructions:\n${prompt}` : '',
            template ? `Required format/template:\n${template}` : '',
        ].filter(Boolean).join('\n');

        sections.push(details);
    }

    if (!sections.length) return '';
    return `\n\n--- ENABLED CUSTOM TRACKER MODULES ---\nThese modules are active for this chat. Follow each module's tracking instructions and output its matching block when creating the character.\n\n${sections.join('\n\n')}`;
}

export const STARTING_GEAR_TIER_OPTIONS = [
    { value: 'auto', label: 'Auto (match setting)' },
    { value: 'mundane', label: 'Mundane only' },
    { value: 'low', label: 'Low' },
    { value: 'standard', label: 'Standard' },
    { value: 'well_equipped', label: 'Well-equipped' },
    { value: 'heroic', label: 'Heroic' },
    { value: 'none', label: 'None — skip gear guidance' },
];

/** @param {string} [selected='auto'] */
export function renderStartingGearTierOptions(selected = 'auto') {
    const tier = STARTING_GEAR_TIER_OPTIONS.some(t => t.value === selected) ? selected : 'auto';
    return STARTING_GEAR_TIER_OPTIONS.map(t =>
        `<option value="${t.value}"${t.value === tier ? ' selected' : ''}>${t.label}</option>`
    ).join('');
}

/** Starting gear depends on the setting, background, and selected gear tier only. */
export function buildStartingGearHint(genre, hasInventory, gearTier = 'auto') {
    const tier = STARTING_GEAR_TIER_OPTIONS.some(t => t.value === gearTier) ? gearTier : 'auto';
    if (tier === 'none') return '';
    const setting = (genre === undefined || genre === null) ? 'fantasy' : genre;
    const fantasy = setting === 'fantasy';
    const base = fantasy
        ? 'Choose practical equipment that fits the character’s background and the setting. Magical or unusually powerful gear needs a clear story source.'
        : 'Choose equipment that fits the character’s background, resources, and the setting; avoid implausibly elite or exotic items without a story source.';
    const tiers = {
        mundane: 'Mundane only: ordinary, non-magical equipment with no exceptional bonuses.',
        low: 'Low tier: basic, worn, or inexpensive equipment; at most one modest quality advantage.',
        standard: 'Standard tier: competent everyday or adventuring kit, with no exceptional loadout by default.',
        well_equipped: 'Well-equipped tier: visibly good quality, useful backups, supplies, and specialist tools where appropriate.',
        heroic: 'Heroic tier: distinctive signature equipment and a complete, high-quality kit appropriate to the story.',
    };
    const tierText = tier === 'auto' ? base : `${tiers[tier]} ${base}`;
    const fantasyNote = fantasy && tier !== 'mundane' && tier !== 'low'
        ? ' Use the selected tier to set the quality and rarity of magical items; never infer gear quality from character advancement.'
        : '';
    const naming = tier === 'well_equipped' || tier === 'heroic'
        ? ' Give one or two notable items names tied to the character’s history.'
        : ' Keep item names and bonuses restrained unless established by the story.';
    const inventoryNote = hasInventory
        ? (tier === 'well_equipped' || tier === 'heroic' ? ' Populate [INVENTORY] with a complete kit and relevant supplies.' : '')
        : ' List key equipped items on the CHARACTER Gear line.';
    return `\n• STARTING GEAR: ${tierText}${fantasyNote}${naming}${inventoryNote}`;
}

/** Prompt fragment for grounded baseline competence and story-based skill growth. */
export function buildCombatAndSkillScalingHint() {
    return `

--- BASELINE COMBAT & SKILLS ---
Set combat competence from demonstrated training, natural attributes, and the equipped weapon/armor. Do not scale combat values, HP, or attributes by character level or accumulated play time. Natural attributes and species-based maximum HP remain stable; equipment quality, condition, fit, enchantments, and repair provide the main combat progression.

Give each character a few credible trained specialties and keep other skills grounded. A skill or spell may be learned or improved only when practice, instruction, discovery, or use in the story supports the change. Record that development in the existing skill or spell field. Do not add use counters, award automatic gains after encounters or quests, or create a separate progression system.

Combat line must remain consistent with the character’s actual training and current gear. A non-combatant, academic, medic, hacker, or pure caster should not receive martial combat competence without a story-supported basis. APR follows the equipment and current combat rules; do not unlock attacks through character advancement.

Firearms (modern/realistic homebrew): when assigning damage on new characters/gear/NPCs/loot, use ~2–3× D&D/PF firearm norms by common sense (type/caliber); reasonable pistol baseline: 2d8+1. Do not inflate attack bonuses — only damage scales. Not a mid-scene conversion rule.`;
}

// ── Renderer / block layout constants ─────────────────────────────────────────

export const BLOCK_ICONS = {
  TIME: '🕒', CHARACTER: '🧙', PARTY: '👥', 'BENCHED PARTY': '⛺',
  COMBAT: '⚔️', INVENTORY: '🎒', ABILITIES: '✨', SPELLS: '📖',
  QUESTS: '📋',
};

// NOTE: 'BENCHED PARTY' has its OWN enable toggle + editable prompt (settings.modules['benched
// party'] / DEFAULT_STOCK_PROMPTS['benched party']) — see ui-editors.js's refreshOrderList,
// which renders it as a nested sub-row directly under PARTY rather than a normal flat entry.
// It's deliberately NOT in BLOCK_ORDER, because BLOCK_ORDER also drives render/tab ordering
// (renderer.js), and [BENCHED PARTY] is intentionally never its own top-level tab/card — it
// always renders folded into PARTY's own section as a compact roster sub-panel, since visually
// it's a sub-state of party membership, not an independent trackable system.
export const BLOCK_ORDER = ['COMBAT', 'CHARACTER', 'PARTY', 'INVENTORY', 'ABILITIES', 'SPELLS', 'TIME', 'QUESTS'];

export const PAGE_SIZE = 8;

/** Sections that should NEVER be paginated — always show all entries. */
export const NO_PAGINATE = new Set(['CHARACTER', 'ABILITIES']);
