
const response = await fetch("http://localhost:3000/vouchers", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    product_variant_id: "825810d1-32b4-4397-960e-018d116fe610",
    product_slug: "steam-wallet-idr",
    variant_name: "60.000 Voucher",
    code: "TEST-VOUCHER-999",
  }),
});

const result = await response.json();
console.log(JSON.stringify(result, null, 2));
console.log("Status:", response.status);
