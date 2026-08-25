import type { Allocation, TargetWeight } from "../types.js";

export function calculateWeights(allocations: Allocation[]): TargetWeight[] {
  const contributionsByTarget = new Map<string, Map<string, number>>();

  for (const allocation of allocations) {
    let contributionsByUser = contributionsByTarget.get(allocation.targetId);

    if (!contributionsByUser) {
      contributionsByUser = new Map<string, number>();
      contributionsByTarget.set(allocation.targetId, contributionsByUser);
    }

    const currentUserTotal = contributionsByUser.get(allocation.userId) ?? 0;
    contributionsByUser.set(
      allocation.userId,
      currentUserTotal + allocation.amount,
    );
  }

  return Array.from(contributionsByTarget, ([targetId, contributionsByUser]) => {
    let rawTotal = 0;
    let squareRootSum = 0;

    for (const userTotal of contributionsByUser.values()) {
      rawTotal += userTotal;
      squareRootSum += Math.sqrt(userTotal);
    }

    return {
      targetId,
      rawTotal,
      uniqueUserCount: contributionsByUser.size,
      weight: Math.pow(squareRootSum, 2),
    };
  });
}
