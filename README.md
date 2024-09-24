# COCOS Backend Challenge

## Overview

This project is part of the [COCOS Backend Challenge](https://github.com/cocos-capital/cocos-challenge/blob/main/backend-challenge.md).

### Technologies

- Node.js
- TypeScript
- TypeORM
- Class Validator
- Express
- Jest
- Swagger

## Installation

To set up this project, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/okinoxis/cocos-backend-challenge.git
cd cocos-backend-challenge
```

2. Install the dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add the following environment variables:

```
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
NODE_ENV=development
PORT=3000
```

4. Run the project:

```bash
npm run start:dev
```

## Swagger Documentation

The project provides a Swagger documentation endpoint at `http://localhost:3000/docs`.

You can access the documentation by navigating to `http://localhost:3000/docs` in your web browser.

## Postman Collection

You can access the Postman collection [here](https://www.postman.com/aviation-astronaut-67328697/workspace/okinoxis/collection/27303646-4e48e9f0-b071-471d-bfec-3ee6ad7ebc08).

## Testing

To run the tests, use the following command:

```bash
npm test
```
![image](https://github.com/user-attachments/assets/504bb90f-afd5-45e6-884c-71145a1da892)

## Routes

The project provides the following routes:

### GET /portfolio/:userId

This route retrieves the portfolio information for a specific user.

#### Parameters

| Name   | Type    | Description                                     |
| ------ | ------- | ----------------------------------------------- |
| userId | integer | The ID of the user whose portfolio to retrieve. |

#### Response

If the user exists, the response will contain the portfolio information for the specified user.

If the user does not exist, the response will contain an error message.

### GET /assets/search

This route searches for assets by ticker or name with pagination.

#### Parameters

| Name     | Type    | Description                                                                 |
| -------- | ------- | --------------------------------------------------------------------------- |
| ticker   | string  | The ticker symbol to search for (partial match, case-insensitive).          |
| name     | string  | The name of the instrument to search for (partial match, case-insensitive). |
| page     | integer | The page number to retrieve.                                                |
| pageSize | integer | The number of items per page.                                               |

#### Response

If the search parameters are valid, the response will contain the assets matching the search criteria.

If the search parameters are invalid, the response will contain an error message.

### POST /orders/submit

This route submits a new order (market or limit) for a user.

#### Parameters

| Name         | Type    | Description                                                      |
| ------------ | ------- | ---------------------------------------------------------------- |
| userId       | integer | The ID of the user who is submitting the order.                  |
| instrumentId | integer | The ID of the instrument for which the order is being submitted. |
| side         | string  | The side of the order (BUY or SELL).                             |
| type         | string  | The type of the order (MARKET or LIMIT).                         |
| quantity     | number  | The quantity of the order.                                       |
| price        | string  | The price of the order (in the case of a LIMIT order).           |

#### Response

If the order is successfully submitted, the response will contain the ID of the submitted order.

If the order is not submitted, the response will contain an error message.

### POST /orders/cancel

This route cancels an existing order for a user.

#### Parameters

| Name    | Type    | Description                          |
| ------- | ------- | ------------------------------------ |
| orderId | integer | The ID of the order to be cancelled. |

#### Response

If the order is successfully cancelled, the response will contain the ID of the cancelled order.

If the order is not cancelled, the response will contain an error message.

## License

This project is licensed under the MIT License.
