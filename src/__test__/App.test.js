import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { ApolloProvider } from "@apollo/client";
import client from "../apolloClient";
import CartForm from "../components/CartForm";
import { startGraphQlStub, stopGraphQlStub } from "specmatic";

const fs = require('fs');
const path = require('path');

global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));
let stub;

function readCartValues() {
  console.log(__dirname);
  console.log(path.resolve(__dirname, '../../test_data/createCart.md'))
  const data = fs.readFileSync(path.resolve(__dirname, '../../test_data/createCart.md'), 'utf-8');
  const firstNameMatch = data.match(/firstName: "([^"]+)"/);
  const surnameMatch = data.match(/surname: "([^"]+)"/);
  const phoneMatch = data.match(/phone: "([^"]+)"/);

  return {
    firstName: firstNameMatch ? firstNameMatch[1] : '',
    surname: surnameMatch ? surnameMatch[1] : '',
    phone: phoneMatch ? phoneMatch[1] : ''
  };
}

beforeAll(async () => {
  stub = await startGraphQlStub("127.0.0.1", 8080, "./test_data");
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
  test('creates a cart and displays cart details', async () => {
    const { firstName, surname, phone } = readCartValues();

    render(
      <ApolloProvider client={client}>
        <CartForm />
      </ApolloProvider>
    );

    // Simulate form submission for creating a cart
    fireEvent.click(screen.getByTestId('createCartButton'));

    // Wait for the cart details to be displayed
    const cartDetails = await screen.findByTestId('cartDetails');

    expect(cartDetails).toBeInTheDocument();
    expect(screen.getByTestId('firstName')).toHaveValue(firstName);
    expect(screen.getByTestId('surname')).toHaveValue(surname);
    expect(screen.getByTestId('phone')).toHaveValue(phone);
  });

  // Test for the fetch cart form
  test('fetches a cart by ID and displays cart details', async () => {
    const { firstName, surname, phone } = readCartValues();

    render(
      <ApolloProvider client={client}>
        <CartForm />
      </ApolloProvider>
    );

    // Simulate form submission for fetching a cart
    fireEvent.click(screen.getByTestId('fetchCartButton'));

    // Wait for the cart details to be displayed
    const fetchedCartDetails = await screen.findByTestId('fetchedCartDetails');

    expect(fetchedCartDetails).toBeInTheDocument();
    expect(screen.getByTestId('firstName')).toHaveValue(firstName);
    expect(screen.getByTestId('surname')).toHaveValue(surname);
    expect(screen.getByTestId('phone')).toHaveValue(phone);
  });

});

afterAll(async () => {
  await stopGraphQlStub(stub);
}, 5000);
