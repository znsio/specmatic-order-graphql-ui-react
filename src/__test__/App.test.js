import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { toast } from "react-toastify";
import ProductForm from "../components/ProductForm";
import { ApolloProvider } from "@apollo/client";
import client from "../apolloClient";
import FindAvailableProductForm from "../components/FindAvailableProductForm";
import { startGraphQlStub, stopGraphQlStub } from "specmatic";

global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));
let stub;

beforeAll(async () => {
  stub = await startGraphQlStub("127.0.0.1", 8080);
}, 5000);

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
  },
  toastContainer: jest.fn(),
}));

describe("App component tests", () => {
  test("should create product with given form fields", async () => {
    await React.act(async () => {
      // Use act from @testing-library/react
      render(
        <ApolloProvider client={client}>
          <ProductForm />
        </ApolloProvider>
      );
    });

    // Fill out the form
    fireEvent.change(screen.getByTestId("name"), { target: { value: "Test Product" } });
    fireEvent.change(screen.getByTestId("inventory"), { target: { value: "10" } });
    fireEvent.change(screen.getByTestId("type"), { target: { value: "gadget" } });

    // Submit the form
    fireEvent.click(screen.getByTestId("submit"));

    // Wait for the mutation to be called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Product added successfully");
    });

    // Optionally, check if the form is cleared
    expect(screen.getByTestId("name").value).toBe("");
    expect(screen.getByTestId("inventory").value).toBe("");
    expect(screen.getByTestId("type").value).toBe("gadget");
  });

  test("should fetch available products", async () => {
    render(
      <ApolloProvider client={client}>
        <FindAvailableProductForm />
      </ApolloProvider>
    );

    // Fill out the form
    fireEvent.change(screen.getByTestId("pageSize"), { target: { value: "10" } });
    fireEvent.change(screen.getByTestId("type"), { target: { value: "gadget" } });

    // Submit the form
    fireEvent.click(screen.getByTestId("submit"));

    // Wait for the form submission and the response
    await waitFor(() => {
      expect(screen.getAllByTestId("product").length).toBeGreaterThan(0);
    });
  });
});

afterAll(async () => {
  await stopGraphQlStub(stub);
}, 5000);
