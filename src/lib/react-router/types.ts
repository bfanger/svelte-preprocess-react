export type Location = {
  pathname: string;
  search: string;
  hash: string;
};

export type Params = Record<string, string>;

export type RouteCondition = { isActive: boolean };

export type To = string | Location;
