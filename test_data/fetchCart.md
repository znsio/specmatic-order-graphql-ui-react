# Create cart

Request

```graphql
{ cart(id: "10") { id firstName surname phone } }
```

Response

```json
{
    "id": "10",
    "firstName": "John",
    "surname": "Doe",
    "phone": "1234567890"
}
```
