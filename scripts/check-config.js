const requiredForLiveApi = ["OPENAI_API_KEY", "OPENAI_VECTOR_STORE_ID"];

const missing = requiredForLiveApi.filter((name) => !process.env[name]);

console.log("SGF chatbot config check");
console.log(`Model: ${process.env.OPENAI_MODEL || "gpt-5.4-mini"}`);
console.log(`Recommended testing budget cap: $${process.env.RECOMMENDED_OPENAI_TEST_BUDGET_USD || "25"}`);

if (missing.length) {
  console.log(`Missing live API values: ${missing.join(", ")}`);
  console.log("Local UI can still run in stub mode.");
  process.exit(0);
}

console.log("Live API configuration values are present.");
