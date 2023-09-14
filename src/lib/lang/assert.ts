export function assert(condition: boolean, msg: string = 'error occured') {
  if (!condition) {
    throw new Error(msg);
  }
}
