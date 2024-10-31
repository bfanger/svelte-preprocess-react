type Props = {
  query: string;
  children: (results: string[]) => React.ReactNode;
};
export default function Search({ query, children }: Props) {
  // The number of results is determined by the length of the query string.
  const results: string[] = new Array(query.length)
    .fill(null)
    .map((_, i) => `result ${i + 1} with ${query}`);

  return children(results);
}
