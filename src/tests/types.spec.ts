import { describe, it } from "vitest";
import type {
  EventName,
  EventProps,
  HandlerName,
  OmitEventProps,
  SvelteEventHandlers,
} from "../lib/internal/types";

const fn: any = () => undefined;

describe("types", () => {
  it("bogus test", () => {
    // Types don't fail at runtime,
    // Use `tsc --noEmit` to verify that the types are correct.

    type ReactProps = { label: string; onClick(): void };

    const testEventProps = fn as (_: EventProps<ReactProps>) => void;
    testEventProps({ onClick: () => undefined });

    const testPropsOmitEventProps = fn as (
      _: OmitEventProps<ReactProps>,
    ) => void;
    testPropsOmitEventProps({ label: "test" });

    const testHandlerName = fn as (_: HandlerName<"click">) => void;
    testHandlerName("onClick");

    const testEventName = fn as (_: EventName<"onClick">) => void;
    testEventName("click");

    type SvelteEvents = {
      click: MouseEvent;
    };
    const testSvelteEventHandlers = fn as (
      _: SvelteEventHandlers<SvelteEvents>,
    ) => void;
    testSvelteEventHandlers({
      onClick(event: MouseEvent) {
        console.info(event);
      },
    });
  });
});
