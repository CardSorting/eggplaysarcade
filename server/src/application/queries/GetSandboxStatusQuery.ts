/**
 * Query to get the status of a sandbox
 * Following CQRS pattern for separating command and query responsibilities
 */
export interface GetSandboxStatusQuery {
  sandboxId: string;
}