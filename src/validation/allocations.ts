import type { Allocation } from "../types.js";

export type AllocationValidationResult =
  | { valid: true; allocations: Allocation[] }
  | { valid: false; error: string };

export function validateAllocations(
  input: unknown,
): AllocationValidationResult {
  if (!Array.isArray(input)) {
    return { valid: false, error: "Input must be an array of allocations." };
  }

  for (let index = 0; index < input.length; index += 1) {
    const allocation = input[index];
    const path = `allocations[${index}]`;

    if (
      typeof allocation !== "object" ||
      allocation === null ||
      Array.isArray(allocation)
    ) {
      return { valid: false, error: `${path} must be an object.` };
    }

    if (!Object.hasOwn(allocation, "userId")) {
      return { valid: false, error: `${path}.userId is required.` };
    }

    if (typeof allocation.userId !== "string") {
      return { valid: false, error: `${path}.userId must be a string.` };
    }

    if (allocation.userId.trim().length === 0) {
      return {
        valid: false,
        error: `${path}.userId must be a non-empty string.`,
      };
    }

    if (!Object.hasOwn(allocation, "targetId")) {
      return { valid: false, error: `${path}.targetId is required.` };
    }

    if (typeof allocation.targetId !== "string") {
      return { valid: false, error: `${path}.targetId must be a string.` };
    }

    if (allocation.targetId.trim().length === 0) {
      return {
        valid: false,
        error: `${path}.targetId must be a non-empty string.`,
      };
    }

    if (!Object.hasOwn(allocation, "amount")) {
      return { valid: false, error: `${path}.amount is required.` };
    }

    if (typeof allocation.amount !== "number") {
      return { valid: false, error: `${path}.amount must be a number.` };
    }

    if (!Number.isFinite(allocation.amount)) {
      return { valid: false, error: `${path}.amount must be finite.` };
    }

    if (allocation.amount < 0) {
      return {
        valid: false,
        error: `${path}.amount must be greater than or equal to zero.`,
      };
    }
  }

  return { valid: true, allocations: input as Allocation[] };
}
