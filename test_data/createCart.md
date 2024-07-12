# Create cart

Request

```graphql
mutation { cartCreate(input: {attributes: {firstName: "John", surname: "Doe", phone: "1234567890"}}) { cart { id firstName surname phone } } }
```

Response

```json
{
    "cart": {
        "id": "10",
        "firstName": "John",
        "surname": "Doe",
        "phone": "1234567890"
    }
}
```
