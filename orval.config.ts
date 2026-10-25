module.exports = {
  "invoicing-api": {
    input: "http://localhost:3000/api-json", // Your NestJS API URL
    output: {
      mode: "tags-split", // 👈 Splits files by NestJS ApiTags
      target: "./src/api/endpoints", // 👈 Creates a folder instead of a single file
      schemas: "./src/api/models", // 👈 Puts TypeScript types in a separate folder
      client: "react-query",
      httpClient: "axios",
      clean: true, // cleans output dir before generating
      prettier: true, // format generated files
      override: {
        mutator: {
          path: "./src/api/mutator/custom-instance.ts",
          name: "customInstance",
        },
      },
    },
  },
};
