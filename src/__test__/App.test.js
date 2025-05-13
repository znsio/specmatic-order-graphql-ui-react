import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";
import ProductForm from "../components/ProductForm";
import { ApolloProvider } from "@apollo/client";
import client from "../apolloClient";
import FindAvailableProductForm from "../components/FindAvailableProductForm";
import { startGraphQlStub, stopGraphQlStub } from "specmatic";
import FindOffersForDate from "../components/FindOffersForDate";
import FindOffersAndProducts from "../components/FindOffersAndProducts";

global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));
let stub;

beforeAll(async () => {
  stub = await startGraphQlStub("127.0.0.1", 8080);
}, 20000);

jest.setTimeout(10000);

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
    const ALLOWED_WAIT_TIME_FOR_RESPONSE = 7000;

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
    }, { timeout: ALLOWED_WAIT_TIME_FOR_RESPONSE });

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

  test("should fetch offers valid until date", async () => {
    render(
      <ApolloProvider client={client}>
        <FindOffersForDate />
      </ApolloProvider>
    );

    fireEvent.change(screen.getByTestId("date"), { target: { value: "2024-12-31" } });
    fireEvent.click(screen.getByTestId("submit"));

    await waitFor(() => {
      expect(screen.getByText("WKND30")).toBeInTheDocument(); 
      expect(screen.getByText("12/12/2024")).toBeInTheDocument(); 
      expect(screen.getByText("SUNDAY20")).toBeInTheDocument(); 
      expect(screen.getByText("12/25/2024")).toBeInTheDocument(); 
    });
  });

  test("should fetch offers and products based on date, type, and page size", async () => {
    render(
      <ApolloProvider client={client}>
        <FindOffersAndProducts />
      </ApolloProvider>
    );

    fireEvent.change(screen.getByTestId("multi-date"), { target: { value: "2024-12-31" } });
    fireEvent.change(screen.getByTestId("multi-type"), { target: { value: "gadget" } });
    fireEvent.change(screen.getByTestId("multi-pageSize"), { target: { value: "10" } });

    fireEvent.click(screen.getByTestId("multi-submit"));

    await waitFor(() => {
      expect(screen.getByText("WKND30")).toBeInTheDocument();
      expect(screen.getByText("12/12/2024")).toBeInTheDocument();
      expect(screen.getByText("SUNDAY20")).toBeInTheDocument();
      expect(screen.getByText("12/25/2024")).toBeInTheDocument();
      expect(screen.getAllByTestId("multi-product").length).toBeGreaterThan(0);
    });
  });

});

afterAll(async () => {
  await stopGraphQlStub(stub);
}, 10000);
