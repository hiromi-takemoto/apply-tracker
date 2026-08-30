export type FormEntry = readonly [name: string, value: string];

function canonical(entries: readonly FormEntry[]) {
  return entries
    .map(([name, value]) => [name, value] as FormEntry)
    .sort(([nameA, valueA], [nameB, valueB]) =>
      nameA.localeCompare(nameB) || valueA.localeCompare(valueB),
    );
}

/** フォーム項目の順序に影響されず、初期値からの変更を判定する。 */
export function hasFormChanged(
  initial: readonly FormEntry[],
  current: readonly FormEntry[],
) {
  const before = canonical(initial);
  const after = canonical(current);
  return before.length !== after.length
    || before.some(([name, value], index) =>
      name !== after[index][0] || value !== after[index][1],
    );
}

export function snapshotForm(form: HTMLFormElement): FormEntry[] {
  return Array.from(new FormData(form).entries(), ([name, value]) => [
    name,
    typeof value === "string" ? value : value.name,
  ]);
}
