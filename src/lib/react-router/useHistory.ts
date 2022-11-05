import useRouterContext from "./internal/useRouterContext.js";

export default function useHistory() {
  const { history } = useRouterContext();
  return history;
}
