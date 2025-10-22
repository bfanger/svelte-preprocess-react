import { useSignals } from "svelte-preprocess-react";

export const user = new (class {
  name = $state("John");
})();

export default function useUsername() {
  useSignals(() => user.name);
  return user.name;
}
