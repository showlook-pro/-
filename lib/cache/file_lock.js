import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { getBuildSessionPath } from './build_session'

const LOCK_MISS = Symbol('lock_miss')
const DEFAULT_TIMEOUT_MS = 30000
const DEFAULT_STALE_LOCK_MS = 120000
const HEARTBEAT_INTERVAL_MS = 15000

function getLockPath(key) {
  const safeKey = String(key).replace(/[^a-z0-9_-]/gi, '_')
  return path.join(getBuildSessionPath('locks'), `${safeKey}.lock`)
}

function createLockPayload() {
  return {
    token: randomUUID(),
    pid: process.pid,
    acquiredAt: Date.now(),
    heartbeatAt: Date.now()
  }
}

function readLockPayload(lockPath) {
  try {
    if (!fs.existsSync(lockPath)) {
      return null
    }

    const raw = fs.readFileSync(lockPath, 'utf8').trim()
    if (!raw) {
      return null
    }

    try {
      const payload = JSON.parse(raw)
      if (payload && typeof payload === 'object') {
        return payload
      }
    } catch {}

    const legacyPid = Number(raw)
    if (Number.isInteger(legacyPid) && legacyPid > 0) {
      const stat = fs.statSync(lockPath)
      return {
        token: null,
        pid: legacyPid,
        acquiredAt: stat.mtimeMs,
        heartbeatAt: stat.mtimeMs
      }
    }

    return null
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null
    }
    throw error
  }
}

function writeLockPayload(lockPath, payload, flag = 'w') {
  fs.mkdirSync(path.dirname(lockPath), { recursive: true })
  fs.writeFileSync(lockPath, JSON.stringify(payload), { flag })
}

function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) {
    return false
  }

  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    if (error.code === 'EPERM') {
      return true
    }
    if (error.code === 'ESRCH') {
      return false
    }
    return true
  }
}

function maybeCleanupStaleLock(lockPath, staleLockMs) {
  try {
    const stat = fs.statSync(lockPath)
    const ageMs = Date.now() - stat.mtimeMs

    if (ageMs < staleLockMs) {
      return false
    }

    const payload = readLockPayload(lockPath)
    if (!payload) {
      fs.rmSync(lockPath, { force: true })
      console.warn(
        `[FileLock][pid:${process.pid}] removed malformed stale lock ${lockPath}`
      )
      return true
    }

    if (!isProcessAlive(Number(payload.pid))) {
      fs.rmSync(lockPath, { force: true })
      console.warn(
        `[FileLock][pid:${process.pid}] removed dead-owner lock key:${path.basename(lockPath)} owner:${payload.pid}`
      )
      return true
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return true
    }
    console.warn(
      `[FileLock] failed to check stale lock ${lockPath}`,
      error.message
    )
  }
  return false
}

function tryAcquire(lockPath, staleLockMs) {
  const payload = createLockPayload()

  try {
    writeLockPayload(lockPath, payload, 'wx')
    return { acquired: true, payload }
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error
    }

    const cleaned = maybeCleanupStaleLock(lockPath, staleLockMs)
    return { acquired: false, cleaned }
  }
}

function startHeartbeat(lockPath, payload) {
  const timer = setInterval(() => {
    try {
      const current = readLockPayload(lockPath)
      if (!current || current.token !== payload.token) {
        return
      }

      current.heartbeatAt = Date.now()
      writeLockPayload(lockPath, current)
    } catch (error) {
      console.warn(
        `[FileLock][pid:${process.pid}] heartbeat failed key:${path.basename(lockPath)}`,
        error.message
      )
    }
  }, HEARTBEAT_INTERVAL_MS)

  if (typeof timer.unref === 'function') {
    timer.unref()
  }

  return timer
}

function release(lockPath, payload) {
  try {
    const current = readLockPayload(lockPath)
    if (!current) {
      return
    }

    if (payload?.token && current.token && current.token !== payload.token) {
      console.warn(
        `[FileLock][pid:${process.pid}] skip release, ownership changed key:${path.basename(lockPath)}`
      )
      return
    }

    fs.unlinkSync(lockPath)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(
        `[FileLock][pid:${process.pid}] release failed key:${path.basename(lockPath)}`,
        error.message
      )
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function waitForUnlock(lockPath, readCache, key, timeout) {
  const start = Date.now()

  while (Date.now() - start < timeout) {
    const cached = await readCache()
    if (cached) {
      console.log(`[FileLock][pid:${process.pid}] wait-hit key:${key}`)
      return cached
    }

    if (!fs.existsSync(lockPath)) {
      return LOCK_MISS
    }

    await sleep(200)
  }

  const cached = await readCache()
  if (cached) {
    console.log(`[FileLock][pid:${process.pid}] timeout-hit key:${key}`)
    return cached
  }

  return LOCK_MISS
}

function normalizeOptions(timeoutOrOptions) {
  if (typeof timeoutOrOptions === 'number') {
    return {
      timeout: timeoutOrOptions,
      staleLockMs: DEFAULT_STALE_LOCK_MS
    }
  }

  return {
    timeout: timeoutOrOptions?.timeout ?? DEFAULT_TIMEOUT_MS,
    staleLockMs: timeoutOrOptions?.staleLockMs ?? DEFAULT_STALE_LOCK_MS
  }
}

export async function withFileLock(
  key,
  fn,
  readCache,
  timeoutOrOptions = DEFAULT_TIMEOUT_MS
) {
  const { timeout, staleLockMs } = normalizeOptions(timeoutOrOptions)
  const lockPath = getLockPath(key)
  const absoluteDeadline = Date.now() + timeout

  while (Date.now() < absoluteDeadline) {
    const attempt = tryAcquire(lockPath, staleLockMs)

    if (attempt.acquired) {
      const heartbeat = startHeartbeat(lockPath, attempt.payload)

      try {
        return await fn(attempt.payload)
      } finally {
        clearInterval(heartbeat)
        release(lockPath, attempt.payload)
      }
    }

    if (attempt.cleaned) {
      console.warn(
        `[FileLock][pid:${process.pid}] retry after stale cleanup key:${key}`
      )
      continue
    }

    console.log(`[FileLock][pid:${process.pid}] waiting key:${key}`)

    const remainingTimeout = absoluteDeadline - Date.now()
    if (remainingTimeout <= 0) break

    const result = await waitForUnlock(
      lockPath,
      readCache,
      key,
      remainingTimeout
    )
    if (result !== LOCK_MISS) {
      return result
    }

    console.warn(`[FileLock][pid:${process.pid}] retry lock key:${key}`)
  }

  console.warn(
    `[FileLock][pid:${process.pid}] ABSOLUTE TIMEOUT (${timeout}ms) key:${key}. Bypassing lock as fallback.`
  )
  return await fn()
}
