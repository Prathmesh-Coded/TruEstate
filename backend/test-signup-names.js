// Simple test script to verify firstName and lastName signup
const fetch = require("node-fetch");

async function testSignupWithNames() {
  try {
    console.log("Testing signup with firstName and lastName...");

    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe.test@example.com",
        password: "password123",
      }),
    });

    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("✅ Signup successful!");
      console.log("User firstName:", data.user.firstName);
      console.log("User lastName:", data.user.lastName);
      console.log("User name:", data.user.name);
    } else {
      console.log("❌ Signup failed:", data.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testSignupWithNames();
