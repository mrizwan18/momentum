import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { DeviceSelect } from "./DeviceSelect";

const twoDevices = [
  { deviceId: "mic-1", label: "Built-in Mic" },
  { deviceId: "mic-2", label: "USB Mic" },
];

describe("DeviceSelect", () => {
  it("renders nothing with 0 or 1 device", () => {
    const { container, rerender } = render(
      <DeviceSelect devices={[]} selectedDeviceId={null} onChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();

    rerender(
      <DeviceSelect
        devices={[twoDevices[0]]}
        selectedDeviceId="mic-1"
        onChange={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("lists every device and calls onChange when a new one is picked", async () => {
    const onChange = vi.fn();
    render(
      <DeviceSelect
        devices={twoDevices}
        selectedDeviceId="mic-1"
        onChange={onChange}
      />,
    );
    expect(
      screen.getByRole("option", { name: "Built-in Mic" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "USB Mic" })).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("Microphone"), "mic-2");
    expect(onChange).toHaveBeenCalledWith("mic-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <DeviceSelect
        devices={twoDevices}
        selectedDeviceId="mic-1"
        onChange={vi.fn()}
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
