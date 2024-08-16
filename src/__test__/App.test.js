import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";
import ProductForm from "../components/ProductForm";
import { ApolloProvider } from "@apollo/client";
import client from "../apolloClient";
import FindAvailableProductForm from "../components/FindAvailableProductForm";
import { startGraphQlStub, stopGraphQlStub } from "specmatic";
import GetDispatchedProductByDateForm from "../components/GetDispatchedProductByDateForm";

global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));
let stub;

beforeAll(async () => {
  stub = await startGraphQlStub("127.0.0.1", 8080);
}, 6000);

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
    fireEvent.change(screen.getByTestId("name"), { target: { value: "The Almanac" } });
    fireEvent.change(screen.getByTestId("inventory"), { target: { value: "10" } });
    fireEvent.change(screen.getByTestId("type"), { target: { value: "book" } });

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

  test("should fetch dispatched product by date", async () => {
    render(
      <ApolloProvider client={client}>
        <GetDispatchedProductByDateForm />
      </ApolloProvider>
    );

    fireEvent.change(screen.getByTestId("date"), { target: { value: "2020-12-12" } });
    fireEvent.click(screen.getByTestId("submit"));

    await waitFor(() => {
      expect(screen.getByText("12/12/2020")).toBeInTheDocument(); // Adjust the date format if needed
    });
});
});

afterAll(async () => {
  await stopGraphQlStub(stub);
}, 5000);
