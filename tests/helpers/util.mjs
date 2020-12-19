export async function wait(msecs = 1000) {
  return new Promise(resolve => setTimeout(() => resolve(), msecs));
}
