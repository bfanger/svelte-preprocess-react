<script lang="ts">
  import { Suspense, lazy } from "react";

  const react = sveltify({
    Suspense,
    Alert: lazy(
      () =>
        new Promise<any>((resolve) => {
          setTimeout(() => {
            resolve(import("../../demo/react-components/Alert"));
          }, 500);
        }),
    ),
  });
</script>

<react.Suspense fallback="Loading...">
  <react.Alert />
</react.Suspense>
