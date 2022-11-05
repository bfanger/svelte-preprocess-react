import useRouterContext from "./internal/useRouterContext.js";

export default function useParams() {
  const { params } = useRouterContext();
  return params;
}
