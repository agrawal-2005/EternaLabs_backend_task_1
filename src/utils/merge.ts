export function mergeList(lists: any[][]) {
  const out: any[] = [];

  for (const list of lists) {
    for (const item of list) {
      out.push(item);
    }
  }

  return out;
}