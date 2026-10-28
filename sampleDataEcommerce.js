use ecommerce

db.users.insertMany([
  {
    _id: ObjectId("66f100000000000000000001"),
    name: { firstName: "Aarav", lastName: "Sharma" },
    email: "aarav.sharma@example.com",
    phone: "+919810001001",
    address: [
      { type: "home", line1: "12 Park Street", city: "Delhi", state: "Delhi", pincode: "110001" },
      { type: "office", line1: "Tech Park, Sector 62", city: "Noida", state: "Uttar Pradesh", pincode: "201309" }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("66f100000000000000000002"),
    name: { firstName: "Priya", lastName: "Verma" },
    email: "priya.verma@example.com",
    phone: "+919810001002",
    address: [
      { type: "home", line1: "45 MG Road", city: "Bengaluru", state: "Karnataka", pincode: "560001" }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("66f100000000000000000003"),
    name: { firstName: "Rohan", lastName: "Gupta" },
    email: "rohan.gupta@example.com",
    phone: "+919810001003",
    address: [
      { type: "home", line1: "22 FC Road", city: "Pune", state: "Maharashtra", pincode: "411004" }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("66f100000000000000000004"),
    name: { firstName: "Ananya", lastName: "Sharma" },
    email: "ananya.sharma@example.com",
    phone: "+919810001004",
    address: [
      { type: "home", line1: "8 Salt Lake", city: "Kolkata", state: "West Bengal", pincode: "700091" },
      { type: "parents", line1: "14 Gariahat Road", city: "Kolkata", state: "West Bengal", pincode: "700029" }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

db.products.insertMany([
  {
    _id: ObjectId("66f200000000000000000001"),
    title: "Wireless Bluetooth Headphones",
    category: "Electronics",
    subCategory: "Audio",
    images: ["headphones-front.jpg", "headphones-side.jpg"],
    salePrice: 1999,
    actualPrice: 2999,
    sku: "ELE-AUD-001",
    attributes: [
      { name: "color", value: "Black" },
      { name: "batteryLife", value: "30 hours" },
      { name: "wireless", value: true }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("66f200000000000000000002"),
    title: "Men Cotton Casual Shirt",
    category: "Fashion",
    subCategory: "Men Clothing",
    images: ["shirt-blue-front.jpg", "shirt-blue-back.jpg"],
    salePrice: 899,
    actualPrice: 1499,
    sku: "FAS-MEN-001",
    attributes: [
      { name: "color", value: "Blue" },
      { name: "size", value: ["M", "L", "XL"] },
      { name: "material", value: "Cotton" }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("66f200000000000000000003"),
    title: "Stainless Steel Water Bottle",
    category: "Home & Kitchen",
    subCategory: "Kitchen Accessories",
    images: ["bottle-main.jpg", "bottle-open.jpg"],
    salePrice: 499,
    actualPrice: 799,
    sku: "HM-KIT-001",
    attributes: [
      { name: "capacity", value: "1 litre" },
      { name: "color", value: "Silver" },
      { name: "material", value: "Stainless Steel" }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("66f200000000000000000004"),
    title: "Running Sports Shoes",
    category: "Fashion",
    subCategory: "Footwear",
    images: ["shoes-main.jpg", "shoes-side.jpg", "shoes-sole.jpg"],
    salePrice: 2499,
    actualPrice: 3999,
    sku: "FAS-FTW-001",
    attributes: [
      { name: "color", value: "White" },
      { name: "size", value: [7, 8, 9, 10] },
      { name: "gender", value: "Unisex" }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

db.cart.insertMany([
  {
    user_id: ObjectId("66f100000000000000000001"),
    cart_content: {
      product_id: ObjectId("66f200000000000000000001"),
      quantity: 1,
      price: 1999
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    user_id: ObjectId("66f100000000000000000002"),
    cart_content: {
      product_id: ObjectId("66f200000000000000000002"),
      quantity: 2,
      price: 899
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    user_id: ObjectId("66f100000000000000000003"),
    cart_content: {
      product_id: ObjectId("66f200000000000000000004"),
      quantity: 1,
      price: 2499
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
])