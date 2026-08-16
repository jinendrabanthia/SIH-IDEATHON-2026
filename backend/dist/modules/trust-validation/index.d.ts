import { VerificationStatus, FactProvenance } from '../../shared/types/index.js';
/**
 * Recomputes the overall trust status for a fact when multiple sources exist.
 * If two VERIFIED sources disagree, it is downgraded to DISPUTED.
 */
export declare function resolveSourceConflicts(facts: FactProvenance[]): VerificationStatus;
/**
 * Validates the LLM-generated explanation text against the provided itinerary items.
 * Strips out or flags any sentences that assert facts without a matching fact ID.
 */
export declare function validateLLMNarration(text: string, validFactIds: string[]): string;
//# sourceMappingURL=index.d.ts.map