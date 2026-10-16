// Messages between the runner (main thread) and its workers.
import type { CaseResult, TypedValue } from '@mcc/shared'

export interface RunRequest {
  source: string
  /** The function to call: snake_case for Python, camelCase for JS. */
  fn: string
  /** Typed JSON args, one array per case. */
  cases: TypedValue[][]
}

export type WorkerMessage =
  | { type: 'ready' }
  | { type: 'load-error'; error: string }
  | { type: 'done'; results: CaseResult[] }
  /** The code didn't load (syntax error, missing function): no case ran. */
  | { type: 'done'; error: string }
