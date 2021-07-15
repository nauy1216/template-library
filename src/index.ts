export function log(msg: string): void {
  console.log('hello template', msg)
  const a = '1'
  const b = {
    a,
    c: 1
  }
  console.log(a, b)
}
