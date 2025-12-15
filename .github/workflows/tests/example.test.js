function sum(a, b) {
  return a + b;
}

test('adds two numbers correctly', () => {
  expect(sum(2, 3)).toBe(5);
});
