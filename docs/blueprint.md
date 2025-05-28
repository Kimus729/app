# **App Name**: VM Query Tool

## Core Features:

- Address Input: Input field for the `scAddress` to query.
- Function Input: Input field for the `funcName` to call.
- Arguments Input: Input field for the `args` (array of strings) of the query (each argument should have its own input field).
- Submit Query: Send a POST request to `https://devnet-gateway.multiversx.com/vm-values/query` with the JSON payload constructed from the input fields. This is triggered by the press of the query button.
- Result Display: Display the JSON response from the API call in a readable format.

## Style Guidelines:

- Primary color: A deep blue (#3F51B5), reminiscent of coding environments and blockchain interfaces, providing a sense of trust and technical depth.
- Background color: Light gray (#EEEEEE), offering a clean, neutral backdrop that reduces eye strain during prolonged use.
- Accent color: A vibrant purple (#9C27B0) for interactive elements like buttons and links, ensuring they stand out against the muted background and complement the primary color.
- Clear, monospaced font to improve readability.
- Simple, column-based layout for input fields and result display.