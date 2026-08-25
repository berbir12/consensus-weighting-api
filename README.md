# Consensus Weighting API

A focused TypeScript backend that gives broad, independent participation more weight than concentrated allocation value.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5-000000?logo=fastify&logoColor=white)](https://fastify.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)

---

## Overview

Raw allocation totals can allow concentrated capital to dominate broad participation. This API implements a consensus-sensitive weighting mechanism where support distributed across many independent contributors receives greater weight than the same amount concentrated in one contributor.

---

## Why Consensus Weighting?

| Scenario | Contributors | Total Allocation | Weight |
| --- | ---: | ---: | ---: |
| Concentrated | 1 | 10,000 | 10,000 |
| Distributed | 100 | 10,000 | 1,000,000 |

Both scenarios allocate the same raw total. The distributed case receives **100× the weight** because the formula recognizes participation from 100 independent contributors instead of concentrating the full amount in one contributor.

---

## Weighting Formula

```text
weight = (Σ √userTotal)²
```

For every request, the service:

1. Groups allocations by target.
2. Groups allocations within each target by user.
3. Combines multiple allocations from the same user.
4. Applies the square root to each user's total.
5. Sums those square-root values.
6. Squares the result.

The square root is applied **after** aggregating a user's allocations. This prevents one contributor from gaining additional influence merely by splitting a contribution across multiple allocation records.

For example:

```text
User 1: 50 + 50 = 100
User 2: 100

weight = (√100 + √100)² = 400
```

Each calculated target contains:

| Field | Meaning |
| --- | --- |
| `targetId` | The target being weighted. |
| `rawTotal` | Sum of every allocation amount for the target. |
| `uniqueUserCount` | Number of distinct users who contributed to the target. |
| `weight` | Consensus-sensitive result of the formula above. |

---

## API

### `POST /api/weights`

Accepts a JSON array of raw allocation objects and returns one calculated result per target.

#### Request

```json
[
  {
    "userId": "user_1",
    "targetId": "target_a",
    "amount": 100
  }
]
```

Multiple allocations from one user to the same target are accepted and combined:

```json
[
  { "userId": "user_1", "targetId": "target_a", "amount": 50 },
  { "userId": "user_1", "targetId": "target_a", "amount": 50 },
  { "userId": "user_2", "targetId": "target_a", "amount": 100 }
]
```

#### Successful response

`200 OK`

```json
[
  {
    "targetId": "target_a",
    "rawTotal": 200,
    "uniqueUserCount": 2,
    "weight": 400
  }
]
```

An empty request array is valid and returns `200 OK` with an empty array:

```json
[]
```

#### Invalid input response

`400 Bad Request`

```json
{
  "error": "allocations[0].amount must be greater than or equal to zero."
}
```

| Status | Meaning |
| ---: | --- |
| `200` | The request body is valid and results were calculated. |
| `400` | The request body failed allocation validation. |

---

## Validation

Input is validated before any calculation begins.

| Input | Rule |
| --- | --- |
| Request body | Must be an array. |
| `userId` | Must be a non-empty string; whitespace-only values are rejected. |
| `targetId` | Must be a non-empty string; whitespace-only values are rejected. |
| `amount` | Must be a finite JavaScript number greater than or equal to zero. |

Zero is valid. Missing values, non-number amounts, negative amounts, `NaN`, and positive or negative infinity are rejected. Validation is implemented without an external validation dependency.

---

## Project Structure

```text
consensus-weighting-api/
├── src/
│   ├── app.ts                    # Builds Fastify and registers routes
│   ├── server.ts                 # Starts the HTTP server
│   ├── types.ts                  # Allocation and TargetWeight types
│   ├── routes/
│   │   └── weights.ts            # Thin POST /api/weights handler
│   ├── services/
│   │   └── weighting.ts          # Pure weighting calculation
│   └── validation/
│       └── allocations.ts        # Runtime validation of unknown input
└── tests/                        # Unit and Fastify injection tests
```

The route delegates input checking to `validateAllocations()` and calculation to `calculateWeights()`. Neither the mathematical service nor the validator depends on Fastify.

---

## Running Locally

### Requirements

- Node.js 20 or newer
- npm

```bash
# Install dependencies
npm install

# Run the development server with file watching
npm run dev

# Run all tests once
npm test

# Compile TypeScript to dist/
npm run build

# Start the compiled server (run the build first)
npm start
```

The server listens on `0.0.0.0` using `PORT` when provided, or port `3000` by default.

---

## Testing

The Vitest suite covers the behavior at three levels:

| Area | Coverage |
| --- | --- |
| Weighting service | Grouping, raw totals, unique users, duplicate allocations, multiple targets, zero values, and empty input. |
| Validation | Valid arrays and rejection of invalid bodies, identifiers, amounts, and allocation entries. |
| Fastify API | Success and error responses through request injection, without starting a network server. |

The suite includes the assessment's concentrated-versus-distributed assertion, confirming that 100 users allocating 100 each receive a weight of 1,000,000 while one user allocating 10,000 receives a weight of 10,000. It also verifies that repeated allocations from one user are combined before applying the square root.

Run the suite with:

```bash
npm test
```

---

## AI Development Process Log

This project utilized AI tooling (primarily OpenAI Codex) to accelerate scaffolding, mathematical implementation, and test generation. All architectural choices, mathematical constraints, and security edge cases were validated independently.

---

### Tooling and Scope

* **Primary Tool:** OpenAI Codex
* **Assisted Areas:** TypeScript/Fastify boilerplate, core formula translation, runtime schema validation, test suite expansion, and technical documentation drafting.

---

### Formula and Grouping Logic Prompting


The implementation was directed to use a quadratic consensus model:

                    Weight = ( sum( sqrt(Total Contribution_u) ) )^2

**Prompt Constraints Enforced:**

* **Two-Tier Aggregation:** Allocations must be partitioned by `targetId`, then grouped by `userId` to compute total user stakes before applying the square root.
* **Anti-Sybil/Split Protection:** Splitting an allocation across multiple entries must yield the exact same weight as a single combined contribution.
* **Test Suite Directives:** Automated cases required for distributed vs. concentrated benchmarks, duplicate entries, malformed payloads, and empty sets.

---

### How AI Was Used

* **Project Scaffolding:** Initializing the Fastify HTTP service, build toolchain, and strict TypeScript configurations.
* **Core Logic Implementation:** Translating the quadratic aggregation and root-sum-squared formulas into clean service methods.
* **Schema Validation:** Writing runtime validation schemas to intercept malformed bodies and enforce strict data types.
* **Test Case Generation:** Producing Fastify request-injection tests and mathematical edge-case suites (e.g., concentrated vs. distributed models).
* **Documentation Support:** Structuring docstrings and drafting README implementation sections.

---

### Manual Verification Checklist

- **Benchmark Accuracy:** Concentrated scenario outputs exactly 10,000; distributed scenario outputs 1,000,000 (>2x participation bonus satisfied).
- **Split Allocation Invariance:** Sub-divided user payments are aggregated prior to radical operations.
- **API Status Contracts:** HTTP 400 Bad Request returned for invalid entries/types; HTTP 200 OK with empty response for `[]`.
- **Target Isolation:** Multi-target arrays are computed independently without cross-leakage.
- **Runtime Audit:** Full TypeScript build pass and manual endpoint verification via `curl`.

---

### AI Adjustments and Manual Corrections

* **Pre-Root Aggregation Gap:** Early generated logic evaluated radical operations on individual payload items rather than aggregating per `userId` first. The grouping pipeline was restructured to sum totals before invoking `Math.sqrt()`.
* **Strict Payload Validation:** Default type coercion was replaced with strict schema guards to intercept malformed objects nested within valid array payloads.