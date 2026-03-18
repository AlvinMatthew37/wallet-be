
const response = await fetch("http://localhost:3000/products");
const products = await response.json();
const variantId = products[0].variants[0].id;
const productSlug = products[0].slug;
const variantName = products[0].variants[0].name;

console.log(JSON.stringify({ variantId, productSlug, variantName }));
