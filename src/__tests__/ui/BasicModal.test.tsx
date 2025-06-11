import BasicModal from "@/components/ui/BasicModal";
import { render, screen, fireEvent } from "@testing-library/react";

describe("BasicModal", () => {
  it("should not render when isOpen is false", () => {
    const { container } = render(
      <BasicModal isOpen={false} onClose={jest.fn()} title="Test Modal">
        <p>Modal Content</p>
      </BasicModal>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("should render title and children when isOpen is true", () => {
    render(
      <BasicModal isOpen={true} onClose={jest.fn()} title="Test Modal">
        <p>Modal Content</p>
      </BasicModal>
    );

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("should call onClose when X icon is clicked", () => {
    const onClose = jest.fn();
    render(
      <BasicModal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Modal Content</p>
      </BasicModal>
    );

    fireEvent.click(screen.getByTestId("close-button"));
    expect(onClose).toHaveBeenCalled();
  });
});
