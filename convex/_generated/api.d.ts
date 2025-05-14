/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as expenses from "../expenses.js";
import type * as http from "../http.js";
import type * as inventory from "../inventory.js";
import type * as issues from "../issues.js";
import type * as menu from "../menu.js";
import type * as orders from "../orders.js";
import type * as properties from "../properties.js";
import type * as sales from "../sales.js";
import type * as seed from "../seed.js";
import type * as snooker_coins from "../snooker_coins.js";
import type * as userActivity from "../userActivity.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  bookings: typeof bookings;
  expenses: typeof expenses;
  http: typeof http;
  inventory: typeof inventory;
  issues: typeof issues;
  menu: typeof menu;
  orders: typeof orders;
  properties: typeof properties;
  sales: typeof sales;
  seed: typeof seed;
  snooker_coins: typeof snooker_coins;
  userActivity: typeof userActivity;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
