// Vitest-compatible subset for running challenge suites inside the sandboxed iframe.
(() => {
  // The document's onerror only covers this script failing to load; from here on,
  // errors are reported through __runChallenge and stray async errors must not abort the run.
  window.onerror = null
  const REACT_VERSION = '19.2.4'
  const TEST_TIMEOUT_MS = 2000
  const real = {
    setTimeout: window.setTimeout.bind(window),
    clearTimeout: window.clearTimeout.bind(window),
    setInterval: window.setInterval.bind(window),
    clearInterval: window.clearInterval.bind(window),
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
    performanceNow: performance.now.bind(performance),
    Date: window.Date,
  }

  // Sandboxed iframes have an opaque origin, so Web Storage access throws.
  function memoryStorage() {
    const map = new Map()
    return {
      get length() { return map.size },
      key: (i) => [...map.keys()][i] ?? null,
      getItem: (k) => (map.has(String(k)) ? map.get(String(k)) : null),
      setItem: (k, v) => { map.set(String(k), String(v)) },
      removeItem: (k) => { map.delete(String(k)) },
      clear: () => map.clear(),
    }
  }
  for (const name of ['localStorage', 'sessionStorage']) {
    try { window[name] } catch {
      Object.defineProperty(window, name, { value: memoryStorage(), configurable: true })
    }
  }

  // Suites are written against jsdom, where these are plain assignable properties.
  window.global = window
  for (const name of ['clipboard', 'geolocation']) {
    Object.defineProperty(navigator, name, { value: navigator[name], writable: true, configurable: true })
  }

  // ── equality ────────────────────────────────────────────
  class Asymmetric {
    constructor(check, label) { this.check = check; this.label = label }
    toJSON() { return this.label }
  }

  function equals(a, b, strict) {
    if (b instanceof Asymmetric) return b.check(a)
    if (a instanceof Asymmetric) return a.check(b)
    if (Object.is(a, b)) return true
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
    if (a instanceof RegExp && b instanceof RegExp) return String(a) === String(b)
    if (Array.isArray(a) !== Array.isArray(b)) return false
    if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false
      for (const [k, v] of a) if (!b.has(k) || !equals(v, b.get(k), strict)) return false
      return true
    }
    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false
      outer: for (const v of a) {
        if (b.has(v)) continue
        for (const w of b) if (equals(v, w, strict)) continue outer
        return false
      }
      return true
    }
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false
      return a.every((v, i) => equals(v, b[i], strict))
    }
    const keys = (o) => Object.keys(o).filter((k) => strict || o[k] !== undefined)
    const ka = keys(a), kb = keys(b)
    if (ka.length !== kb.length) return false
    return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && equals(a[k], b[k], strict))
  }

  function fmt(v) {
    if (typeof v === 'function') return v.name ? `[Function ${v.name}]` : '[Function]'
    if (typeof v === 'string') return JSON.stringify(v)
    if (typeof v === 'bigint') return v + 'n'
    if (v === undefined) return 'undefined'
    if (typeof v === 'symbol') return v.toString()
    if (v instanceof Error) return `${v.name}: ${v.message}`
    if (v instanceof Map) return `Map(${fmt([...v])})`
    if (v instanceof Set) return `Set(${fmt([...v])})`
    if (typeof Node !== 'undefined' && v instanceof Node) return `<${v.nodeName.toLowerCase()}>`
    try {
      return JSON.stringify(v, (_k, x) => (x === undefined ? '__undef__' : typeof x === 'function' ? '[Function]' : x))
        .replace(/"__undef__"/g, 'undefined')
    } catch {
      return String(v)
    }
  }

  // ── expect ──────────────────────────────────────────────
  function isMock(fn) {
    return typeof fn === 'function' && fn._isMockFunction === true
  }

  function assertMock(fn) {
    if (!isMock(fn)) throw new Error(`${fmt(fn)} is not a spy or a call to a spy`)
  }

  function getPath(obj, path) {
    const parts = Array.isArray(path) ? path : String(path).replace(/\[(\w+)\]/g, '.$1').split('.')
    let cur = obj
    for (const p of parts) {
      if (cur === null || cur === undefined || !(Object(cur) instanceof Object) || !(p in Object(cur))) {
        return { found: false }
      }
      cur = cur[p]
    }
    return { found: true, value: cur }
  }

  function thrownBy(fn) {
    try { fn() } catch (e) { return { threw: true, error: e } }
    return { threw: false }
  }

  function errorMatches(error, expected) {
    if (expected === undefined) return true
    const message = error && error.message !== undefined ? error.message : String(error)
    if (typeof expected === 'string') return message.includes(expected)
    if (expected instanceof RegExp) return expected.test(message)
    if (typeof expected === 'function') return error instanceof expected
    if (expected instanceof Error) return message === expected.message
    return equals(error, expected)
  }

  const matchers = {
    toBe: (r, e) => [Object.is(r, e), `expected ${fmt(r)} to be ${fmt(e)}`],
    toEqual: (r, e) => [equals(r, e, false), `expected ${fmt(r)} to equal ${fmt(e)}`],
    toStrictEqual: (r, e) => [equals(r, e, true), `expected ${fmt(r)} to strictly equal ${fmt(e)}`],
    toBeNull: (r) => [r === null, `expected ${fmt(r)} to be null`],
    toBeUndefined: (r) => [r === undefined, `expected ${fmt(r)} to be undefined`],
    toBeDefined: (r) => [r !== undefined, `expected ${fmt(r)} to be defined`],
    toBeTruthy: (r) => [!!r, `expected ${fmt(r)} to be truthy`],
    toBeFalsy: (r) => [!r, `expected ${fmt(r)} to be falsy`],
    toBeNaN: (r) => [Number.isNaN(r), `expected ${fmt(r)} to be NaN`],
    toBeGreaterThan: (r, e) => [r > e, `expected ${fmt(r)} to be greater than ${fmt(e)}`],
    toBeGreaterThanOrEqual: (r, e) => [r >= e, `expected ${fmt(r)} to be greater than or equal to ${fmt(e)}`],
    toBeLessThan: (r, e) => [r < e, `expected ${fmt(r)} to be less than ${fmt(e)}`],
    toBeLessThanOrEqual: (r, e) => [r <= e, `expected ${fmt(r)} to be less than or equal to ${fmt(e)}`],
    toBeCloseTo: (r, e, digits = 2) => [
      Math.abs(r - e) < Math.pow(10, -digits) / 2,
      `expected ${fmt(r)} to be close to ${fmt(e)}`,
    ],
    toBeInstanceOf: (r, e) => [r instanceof e, `expected ${fmt(r)} to be an instance of ${e && e.name}`],
    toBeTypeOf: (r, e) => [typeof r === e, `expected ${fmt(r)} to be of type ${e}`],
    toHaveLength: (r, e) => [
      r !== null && r !== undefined && r.length === e,
      `expected ${fmt(r)} to have length ${e} but got ${r && r.length}`,
    ],
    toContain: (r, e) => [
      typeof r === 'string' ? r.includes(e) : r != null && Array.from(r).includes(e),
      `expected ${fmt(r)} to contain ${fmt(e)}`,
    ],
    toContainEqual: (r, e) => [
      r != null && Array.from(r).some((x) => equals(x, e, false)),
      `expected ${fmt(r)} to contain an item equal to ${fmt(e)}`,
    ],
    toMatch: (r, e) => [
      typeof e === 'string' ? String(r).includes(e) : e.test(String(r)),
      `expected ${fmt(r)} to match ${fmt(String(e))}`,
    ],
    toMatchObject: (r, e) => [matchesObject(r, e), `expected ${fmt(r)} to match object ${fmt(e)}`],
    toHaveProperty: (r, path, ...value) => {
      const got = getPath(r, path)
      const pass = got.found && (value.length === 0 || equals(got.value, value[0], false))
      return [pass, `expected ${fmt(r)} to have property ${fmt(path)}${value.length ? ` = ${fmt(value[0])}` : ''}`]
    },
    toThrow: (r, e) => {
      const res = r && r.__rejected ? { threw: true, error: r.error } : thrownBy(r)
      if (!res.threw) return [false, `expected function to throw${e !== undefined ? ` ${fmt(e)}` : ''}`]
      return [errorMatches(res.error, e), `expected error ${fmt(res.error)} to match ${fmt(e)}`]
    },
    toHaveBeenCalled: (r) => {
      assertMock(r)
      return [r.mock.calls.length > 0, `expected spy to have been called (called ${r.mock.calls.length} times)`]
    },
    toHaveBeenCalledTimes: (r, n) => {
      assertMock(r)
      return [r.mock.calls.length === n, `expected spy to be called ${n} times, but got ${r.mock.calls.length}`]
    },
    toHaveBeenCalledWith: (r, ...args) => {
      assertMock(r)
      return [
        r.mock.calls.some((c) => equals(c, args, false)),
        `expected spy to have been called with ${fmt(args)}; calls: ${fmt(r.mock.calls)}`,
      ]
    },
    toHaveBeenLastCalledWith: (r, ...args) => {
      assertMock(r)
      const last = r.mock.calls[r.mock.calls.length - 1]
      return [!!last && equals(last, args, false), `expected last call to be ${fmt(args)} but got ${fmt(last)}`]
    },
    toHaveBeenNthCalledWith: (r, n, ...args) => {
      assertMock(r)
      const call = r.mock.calls[n - 1]
      return [!!call && equals(call, args, false), `expected call #${n} to be ${fmt(args)} but got ${fmt(call)}`]
    },
    toHaveReturnedWith: (r, v) => {
      assertMock(r)
      return [
        r.mock.results.some((x) => x.type === 'return' && equals(x.value, v, false)),
        `expected spy to have returned ${fmt(v)}`,
      ]
    },
  }
  matchers.toThrowError = matchers.toThrow
  matchers.toBeCalled = matchers.toHaveBeenCalled
  matchers.toBeCalledTimes = matchers.toHaveBeenCalledTimes
  matchers.toBeCalledWith = matchers.toHaveBeenCalledWith

  function matchesObject(r, e) {
    if (typeof e !== 'object' || e === null || e instanceof Asymmetric) return equals(r, e, false)
    if (typeof r !== 'object' || r === null) return false
    if (Array.isArray(e)) return Array.isArray(r) && r.length === e.length && e.every((v, i) => matchesObject(r[i], v))
    return Object.keys(e).every((k) => k in r && matchesObject(r[k], e[k]))
  }

  function buildMatchers(received, { negate, mode }) {
    const out = {}
    for (const [name, matcher] of Object.entries(matchers)) {
      const check = (value, args) => {
        const [pass, message] = matcher(value, ...args)
        if (pass === negate) throw new Error(negate ? message.replace(/^expected (.*?) to /, 'expected $1 not to ') : message)
      }
      out[name] = (...args) => {
        if (!mode) return check(received, args)
        return Promise.resolve(received).then(
          (value) => {
            if (mode === 'rejects') throw new Error(`promise resolved ${fmt(value)} instead of rejecting`)
            check(value, args)
          },
          (error) => {
            if (mode === 'resolves') throw new Error(`promise rejected ${fmt(error)} instead of resolving`)
            check(name === 'toThrow' || name === 'toThrowError' ? { __rejected: true, error } : error, args)
          },
        )
      }
    }
    return out
  }

  function expect(received) {
    const api = buildMatchers(received, { negate: false })
    api.not = buildMatchers(received, { negate: true })
    api.resolves = buildMatchers(received, { negate: false, mode: 'resolves' })
    api.resolves.not = buildMatchers(received, { negate: true, mode: 'resolves' })
    api.rejects = buildMatchers(received, { negate: false, mode: 'rejects' })
    api.rejects.not = buildMatchers(received, { negate: true, mode: 'rejects' })
    return api
  }
  expect.any = (ctor) =>
    new Asymmetric(
      (v) =>
        v !== null && v !== undefined &&
        (v instanceof ctor ||
          (ctor === Number && typeof v === 'number') ||
          (ctor === String && typeof v === 'string') ||
          (ctor === Boolean && typeof v === 'boolean') ||
          (ctor === Function && typeof v === 'function') ||
          (ctor === Object && typeof v === 'object')),
      `Any<${ctor.name}>`,
    )
  expect.anything = () => new Asymmetric((v) => v !== null && v !== undefined, 'Anything')
  expect.objectContaining = (o) => new Asymmetric((v) => matchesObject(v, o), `ObjectContaining ${fmt(o)}`)
  expect.arrayContaining = (arr) =>
    new Asymmetric((v) => Array.isArray(v) && arr.every((x) => v.some((y) => equals(y, x, false))), `ArrayContaining ${fmt(arr)}`)
  expect.stringContaining = (s) => new Asymmetric((v) => typeof v === 'string' && v.includes(s), `StringContaining ${fmt(s)}`)
  expect.stringMatching = (re) => new Asymmetric((v) => typeof v === 'string' && new RegExp(re).test(v), `StringMatching ${re}`)

  // ── vi: mocks ───────────────────────────────────────────
  function fn(impl) {
    let defaultImpl = impl
    let onceImpls = []
    let name = 'vi.fn()'
    const mock = { calls: [], results: [], instances: [], contexts: [], lastCall: undefined }

    function mockFn(...args) {
      mock.calls.push(args)
      mock.lastCall = args
      mock.contexts.push(this)
      if (new.target) mock.instances.push(this)
      const current = onceImpls.length ? onceImpls.shift() : defaultImpl
      try {
        let value
        if (!current) value = undefined
        else if (new.target && current.prototype) value = Reflect.construct(current, args, new.target)
        else value = current.apply(this, args)
        mock.results.push({ type: 'return', value })
        return value
      } catch (error) {
        mock.results.push({ type: 'throw', value: error })
        throw error
      }
    }

    mockFn._isMockFunction = true
    mockFn.mock = mock
    mockFn.getMockName = () => name
    mockFn.mockName = (n) => { name = n; return mockFn }
    mockFn.getMockImplementation = () => defaultImpl
    mockFn.mockImplementation = (f) => { defaultImpl = f; return mockFn }
    mockFn.mockImplementationOnce = (f) => { onceImpls.push(f); return mockFn }
    mockFn.mockReturnValue = (v) => mockFn.mockImplementation(() => v)
    mockFn.mockReturnValueOnce = (v) => mockFn.mockImplementationOnce(() => v)
    mockFn.mockResolvedValue = (v) => mockFn.mockImplementation(() => Promise.resolve(v))
    mockFn.mockResolvedValueOnce = (v) => mockFn.mockImplementationOnce(() => Promise.resolve(v))
    mockFn.mockRejectedValue = (v) => mockFn.mockImplementation(() => Promise.reject(v))
    mockFn.mockRejectedValueOnce = (v) => mockFn.mockImplementationOnce(() => Promise.reject(v))
    mockFn.mockReturnThis = () => mockFn.mockImplementation(function () { return this })
    mockFn.mockClear = () => {
      mock.calls = []; mock.results = []; mock.instances = []; mock.contexts = []; mock.lastCall = undefined
      return mockFn
    }
    mockFn.mockReset = () => {
      mockFn.mockClear(); defaultImpl = impl; onceImpls = []
      return mockFn
    }
    mockFn.mockRestore = () => mockFn.mockReset()
    return mockFn
  }

  const spies = []
  function spyOn(obj, key, accessType) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, key)
    let spy
    if (accessType === 'get' || accessType === 'set') {
      const original = descriptor
        ? descriptor[accessType]
        : (Object.getOwnPropertyDescriptor(Object.getPrototypeOf(obj), key) || {})[accessType]
      spy = fn(original)
      Object.defineProperty(obj, key, { configurable: true, [accessType]: spy })
    } else {
      const original = obj[key]
      spy = fn(function (...args) { return original.apply(this, args) })
      obj[key] = spy
    }
    const restore = () => {
      if (descriptor) Object.defineProperty(obj, key, descriptor)
      else delete obj[key]
    }
    spy.mockRestore = () => { spy.mockReset(); restore() }
    spies.push(spy)
    return spy
  }

  const stubbedGlobals = new Map()
  function stubGlobal(name, value) {
    if (!stubbedGlobals.has(name)) stubbedGlobals.set(name, Object.getOwnPropertyDescriptor(window, name))
    Object.defineProperty(window, name, { value, writable: true, configurable: true, enumerable: true })
    return vi
  }
  function unstubAllGlobals() {
    for (const [name, descriptor] of stubbedGlobals) {
      if (descriptor) Object.defineProperty(window, name, descriptor)
      else delete window[name]
    }
    stubbedGlobals.clear()
    return vi
  }

  // ── vi: fake timers ─────────────────────────────────────
  let clock = null

  function FakeDateFactory() {
    const RealDate = real.Date
    function FakeDate(...args) {
      if (!new.target) return new RealDate(clock.now).toString()
      return args.length ? new RealDate(...args) : new RealDate(clock.now)
    }
    FakeDate.prototype = RealDate.prototype
    FakeDate.now = () => clock.now
    FakeDate.parse = RealDate.parse
    FakeDate.UTC = RealDate.UTC
    return FakeDate
  }

  function schedule(callback, delay, args, interval) {
    const id = clock.nextId++
    const ms = Math.max(0, Number(delay) || 0)
    clock.timers.set(id, { id, callback, args, at: clock.now + ms, interval: interval ? Math.max(1, ms) : 0 })
    return id
  }

  function nextTimer(limit) {
    let next = null
    for (const t of clock.timers.values()) {
      if (t.at > limit) continue
      if (!next || t.at < next.at || (t.at === next.at && t.id < next.id)) next = t
    }
    return next
  }

  function fire(timer) {
    clock.now = timer.at
    if (timer.interval) timer.at += timer.interval
    else clock.timers.delete(timer.id)
    if (timer.raf) timer.callback(clock.perfNow())
    else if (typeof timer.callback === 'function') timer.callback(...timer.args)
  }

  function useFakeTimers() {
    if (clock) return vi
    const start = real.Date.now()
    const perfStart = real.performanceNow()
    clock = { now: start, nextId: 1, timers: new Map(), perfNow: () => perfStart + (clock.now - start) }
    window.setTimeout = (cb, delay, ...args) => schedule(cb, delay, args, false)
    window.setInterval = (cb, delay, ...args) => schedule(cb, delay, args, true)
    window.clearTimeout = window.clearInterval = (id) => { if (clock) clock.timers.delete(id) }
    window.requestAnimationFrame = (cb) => {
      const id = schedule(cb, 16 - ((clock.now - start) % 16) || 16, [], false)
      clock.timers.get(id).raf = true
      return id
    }
    window.cancelAnimationFrame = (id) => { if (clock) clock.timers.delete(id) }
    performance.now = () => clock.perfNow()
    window.Date = FakeDateFactory()
    return vi
  }

  function useRealTimers() {
    if (!clock) return vi
    clock = null
    window.setTimeout = real.setTimeout
    window.clearTimeout = real.clearTimeout
    window.setInterval = real.setInterval
    window.clearInterval = real.clearInterval
    window.requestAnimationFrame = real.requestAnimationFrame
    window.cancelAnimationFrame = real.cancelAnimationFrame
    performance.now = real.performanceNow
    window.Date = real.Date
    return vi
  }

  function requireFake(name) {
    if (!clock) throw new Error(`vi.${name}() requires vi.useFakeTimers()`)
  }

  // Suites advance timers without wrapping in act(), so flush React updates for them.
  function inAct(callback) {
    return react ? react.React.act(callback) : callback()
  }

  function advanceTimersByTime(ms) {
    requireFake('advanceTimersByTime')
    inAct(() => {
      const target = clock.now + ms
      for (let t = nextTimer(target); t && clock; t = nextTimer(target)) fire(t)
      if (clock) clock.now = target
    })
    return vi
  }

  const flushMicrotasks = () => new Promise((resolve) => real.setTimeout(resolve, 0))

  async function advanceTimersByTimeAsync(ms) {
    requireFake('advanceTimersByTimeAsync')
    await inAct(async () => {
      const target = clock.now + ms
      await flushMicrotasks()
      for (let t = nextTimer(target); t && clock; t = nextTimer(target)) {
        fire(t)
        await flushMicrotasks()
      }
      if (clock) clock.now = target
    })
    return vi
  }

  function runAllTimers() {
    requireFake('runAllTimers')
    inAct(() => {
      for (let i = 0; clock && clock.timers.size && i < 10000; i++) fire(nextTimer(Infinity))
    })
    return vi
  }

  async function runAllTimersAsync() {
    requireFake('runAllTimersAsync')
    await inAct(async () => {
      await flushMicrotasks()
      for (let i = 0; clock && clock.timers.size && i < 10000; i++) {
        fire(nextTimer(Infinity))
        await flushMicrotasks()
      }
    })
    return vi
  }

  const vi = {
    fn,
    spyOn,
    stubGlobal,
    unstubAllGlobals,
    isMockFunction: isMock,
    clearAllMocks: () => { spies.forEach((s) => s.mockClear()); return vi },
    restoreAllMocks: () => { spies.splice(0).forEach((s) => s.mockRestore()); return vi },
    useFakeTimers,
    useRealTimers,
    advanceTimersByTime,
    advanceTimersByTimeAsync,
    runAllTimers,
    runAllTimersAsync,
    getTimerCount: () => (clock ? clock.timers.size : 0),
    clearAllTimers: () => { if (clock) clock.timers.clear(); return vi },
    setSystemTime: (t) => { requireFake('setSystemTime'); clock.now = new real.Date(t).getTime(); return vi },
  }

  // ── React testing helpers ───────────────────────────────
  let react = null
  const mounted = new Set()

  function requireReact() {
    if (!react) throw new Error('React is not available in this challenge')
    return react
  }

  function act(callback) {
    return requireReact().React.act(callback)
  }

  function render(ui, options = {}) {
    const { React, ReactDOMClient } = requireReact()
    const container = options.container || document.body.appendChild(document.createElement('div'))
    const root = ReactDOMClient.createRoot(container)
    const wrap = (el) => (options.wrapper ? React.createElement(options.wrapper, null, el) : el)
    const entry = { root, container }
    mounted.add(entry)
    try {
      act(() => root.render(wrap(ui)))
    } catch (error) {
      unmountEntry(entry)
      throw error
    }
    return {
      container,
      baseElement: document.body,
      rerender: (next) => act(() => root.render(wrap(next))),
      unmount: () => unmountEntry(entry),
    }
  }

  function unmountEntry(entry) {
    if (!mounted.delete(entry)) return
    act(() => entry.root.unmount())
    if (entry.container.parentNode === document.body) entry.container.remove()
  }

  function renderHook(callback, options = {}) {
    const { React } = requireReact()
    const result = { current: undefined }
    function TestComponent({ hookProps }) {
      result.current = callback(hookProps)
      return null
    }
    const view = render(React.createElement(TestComponent, { hookProps: options.initialProps }), options)
    return {
      result,
      rerender: (props) => view.rerender(React.createElement(TestComponent, { hookProps: props })),
      unmount: view.unmount,
    }
  }

  function cleanup() {
    for (const entry of [...mounted]) {
      try { unmountEntry(entry) } catch { /* already broken by the test */ }
    }
  }

  function loadReact() {
    const base = 'https://esm.sh/'
    const deps = `?dev&deps=react@${REACT_VERSION}`
    return Promise.all([
      import(`${base}react@${REACT_VERSION}?dev`),
      import(`${base}react-dom@${REACT_VERSION}${deps}`),
      import(`${base}react-dom@${REACT_VERSION}/client${deps}`),
    ]).then(([React, ReactDOM, ReactDOMClient]) => {
      window.IS_REACT_ACT_ENVIRONMENT = true
      const createElement = React.createElement
      const jsx = (type, props, key) => createElement(type, key === undefined ? props : { ...props, key })
      react = { React, ReactDOMClient }
      return {
        react: React,
        'react-dom': ReactDOM,
        'react-dom/client': ReactDOMClient,
        'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: React.Fragment },
      }
    })
  }

  // ── runner ──────────────────────────────────────────────
  const tests = []
  const beforeEachHooks = []
  const afterEachHooks = []

  function test(name, fn) { tests.push({ name, fn }) }
  test.skip = () => {}
  test.only = test
  test.todo = () => {}

  Object.assign(window, {
    test,
    it: test,
    describe: (_name, fn) => fn(),
    beforeEach: (fn) => beforeEachHooks.push(fn),
    afterEach: (fn) => afterEachHooks.push(fn),
    beforeAll: (fn) => beforeEachHooks.push(once(fn)),
    afterAll: () => {},
    expect,
    vi,
    act,
    render,
    renderHook,
    cleanup,
  })

  function once(fn) {
    let done = false
    return () => { if (!done) { done = true; return fn() } }
  }

  function withTimeout(promise) {
    let id
    const timeout = new Promise((_, reject) => {
      id = real.setTimeout(() => reject(new Error(`Test timed out after ${TEST_TIMEOUT_MS}ms`)), TEST_TIMEOUT_MS)
    })
    return Promise.race([promise, timeout]).finally(() => real.clearTimeout(id))
  }

  async function runTests() {
    const results = []
    const start = real.performanceNow()
    for (const t of tests) {
      try {
        await withTimeout((async () => {
          for (const hook of beforeEachHooks) await hook()
          try {
            await t.fn()
          } finally {
            for (const hook of afterEachHooks) await hook()
          }
        })())
        results.push({ name: t.name, passed: true })
      } catch (e) {
        results.push({ name: t.name, passed: false, error: e && e.message ? e.message : String(e) })
      } finally {
        cleanup()
        useRealTimers()
      }
    }
    return { results, passed: results.every((r) => r.passed), totalMs: Math.round(real.performanceNow() - start) }
  }

  const post = (data) => window.parent.postMessage(data, '*')

  window.__runChallenge = async (code, suite, { jsx }) => {
    try {
      const modules = jsx ? await loadReact() : {}
      const compiled = Babel.transform(`${code}\n;\n${suite}`, {
        filename: jsx ? 'solution.tsx' : 'solution.ts',
        presets: ['typescript', ...(jsx ? [['react', { runtime: 'automatic' }]] : [])],
        plugins: ['transform-modules-commonjs'],
      }).code
      const require = (name) => {
        if (!(name in modules)) throw new Error(`Cannot import "${name}" in this challenge`)
        return modules[name]
      }
      const module = { exports: {} }
      new Function('require', 'module', 'exports', compiled)(require, module, module.exports)
      post({ type: 'test-result', ...(await runTests()) })
    } catch (e) {
      post({ type: 'test-error', message: e && e.message ? e.message : String(e) })
    }
  }
})()
