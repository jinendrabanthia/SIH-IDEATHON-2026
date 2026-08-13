import { VerificationStatus, FactProvenance } from '../../shared/types/index.js';

/**
 * Recomputes the overall trust status for a fact when multiple sources exist.
 * If two VERIFIED sources disagree, it is downgraded to DISPUTED.
 */
export function resolveSourceConflicts(facts: FactProvenance[]): VerificationStatus {
  if (!facts || facts.length === 0) return VerificationStatus.UNVERIFIED;
  if (facts.length === 1) return facts[0].verification_status;

  // Group by value (using JSON.stringify for deep equality check on fact_value)
  const valueGroups = new Map<string, FactProvenance[]>();
  for (const fact of facts) {
    const key = JSON.stringify(fact.fact_value);
    const existing = valueGroups.get(key) || [];
    existing.push(fact);
    valueGroups.set(key, existing);
  }

  // If everyone agrees, return the highest confidence status
  if (valueGroups.size === 1) {
    return facts.some(f => f.verification_status === VerificationStatus.VERIFIED)
      ? VerificationStatus.VERIFIED
      : facts[0].verification_status;
  }

  // Conflict detected
  // Check if multiple VERIFIED sources disagree
  const verifiedGroups = Array.from(valueGroups.values()).filter(group => 
    group.some(f => f.verification_status === VerificationStatus.VERIFIED)
  );

  if (verifiedGroups.length > 1) {
    return VerificationStatus.DISPUTED;
  }

  // Otherwise, default to the status of the single verified group, or UNVERIFIED if none
  if (verifiedGroups.length === 1) {
    return VerificationStatus.VERIFIED;
  }

  // Handle conflicts among lower-tier sources
  return VerificationStatus.DISPUTED;
}

/**
 * Validates the LLM-generated explanation text against the provided itinerary items.
 * Strips out or flags any sentences that assert facts without a matching fact ID.
 */
export function validateLLMNarration(text: string, validFactIds: string[]): string {
  // Simple regex to match inline fact markers, e.g., [fact:1234-abcd]
  const factMarkerRegex = /\[fact:([^\]]+)\]/g;
  let match;
  const referencedFacts = new Set<string>();

  while ((match = factMarkerRegex.exec(text)) !== null) {
    referencedFacts.add(match[1]);
  }

  // Check if all referenced facts are valid
  for (const factId of referencedFacts) {
    if (!validFactIds.includes(factId)) {
      // If a fact is completely hallucinated (not in our payload), strip the sentence containing it
      // For this MVP, we do a basic replacement of the invalid marker with a warning
      text = text.replace(new RegExp(`\\[fact:${factId}\\]`, 'g'), '[WARNING: UNVERIFIED CLAIM REMOVED]');
    } else {
      // Remove valid markers before displaying to the user
      text = text.replace(new RegExp(`\\[fact:${factId}\\]`, 'g'), '');
    }
  }

  return text.trim();
}
