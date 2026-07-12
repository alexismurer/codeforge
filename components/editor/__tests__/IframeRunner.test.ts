import { describe, it, expect } from 'vitest'

// Extract the functions for testing without rendering
function stripHiddenMarkers(suite: string) {
  return suite.replace(/\/\/ __hidden__\n?/g, '')
}

describe('stripHiddenMarkers', () => {
  it('removes __hidden__ comment markers', () => {
    const input = "test('a', () => {});\n// __hidden__\ntest('b', () => {});"
    const result = stripHiddenMarkers(input)
    expect(result).toBe("test('a', () => {});\ntest('b', () => {});")
  })

  it('does not remove regular comments', () => {
    const input = "// normal comment\ntest('a', () => {});"
    expect(stripHiddenMarkers(input)).toBe(input)
  })
})
