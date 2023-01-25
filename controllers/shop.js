const fs = require("fs");
const path = require("path");
const Product = require("../models/product");
const Order = require("../models/order");
const PDFDocument = require("pdfkit");
const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
	const page = +req.query.page || 1;
	let totalItems;
	Product.find()
		.countDocuments()
		.then((numProducts) => {
			totalItems = numProducts;
			return Product.find()
			//only in mongoDB
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE);
		})
		.then((products) => {
			res.render("shop/product-list", {
				prods: products,
				pageTitle: "Products",
				path: "/products",
				currentPage: page,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: page + 1,
				previousPage: page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getProduct = (req, res, next) => {
	const prodId = req.params.productId;
	Product.findById(prodId)
		.then((product) => {
			res.render("shop/product-detail", {
				product: product,
				pageTitle: product.title,
				path: "/products",
				isAuthenticated: req.session.isLoggedIn,
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getIndex = (req, res, next) => {
	const page = +req.query.page || 1;
	let totalItems;
	Product.find()
		.countDocuments()
		.then((numProducts) => {
			totalItems = numProducts;
			return Product.find()
				.skip((page - 1) * ITEMS_PER_PAGE)
				.limit(ITEMS_PER_PAGE);
		})
		.then((products) => {
			res.render("shop/index", {
				prods: products,
				pageTitle: "Shop",
				path: "/",
				currentPage: page,
				hasNextPage: ITEMS_PER_PAGE * page < totalItems,
				hasPreviousPage: page > 1,
				nextPage: page + 1,
				previousPage: page - 1,
				lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		});
};

exports.getCart = (req, res, next) => {
	req.user
		.populate("cart.items.productId")
		.then((user) => {
			const products = user.cart.items;
			res.render("shop/cart", {
				path: "/cart",
				pageTitle: "Your Cart",
				products: products,
				isAuthenticated: req.session.isLoggedIn,
			});
		})
		.catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
	const prodId = req.body.productId;
	Product.findById(prodId)
		.then((product) => {
			return req.user.addToCart(product);
		})
		.then((result) => {
			console.log(result);
			res.redirect("/cart");
		});
};

exports.postCartDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	req.user
		.removeFromCart(prodId)
		.then((result) => {
			res.redirect("/cart");
		})
		.catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
	req.user
		.populate("cart.items.productId")
		.then((user) => {
			const products = user.cart.items.map((i) => {
				return { quantity: i.quantity, product: { ...i.productId._doc } };
			});
			const order = new Order({
				user: {
					// name: req.user.name,
					email: req.user.email,
					userId: req.user,
				},
				products: products,
			});
			return order.save();
		})
		.then((result) => {
			return req.user.clearCart();
		})
		.then(() => {
			res.redirect("/orders");
		})
		.catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
	Order.find({ "user.userId": req.user._id })
		.then((orders) => {
			res.render("shop/orders", {
				path: "/orders",
				pageTitle: "Your Orders",
				orders: orders,
				isAuthenticated: req.session.isLoggedIn,
			});
		})
		.catch((err) => console.log(err));
};

exports.getInvoice = (req, res, next) => {
	const orderId = req.params.orderId;
		console.log(`🚀 ~ file: shop.js:167 ~ orderId`, orderId);
		
	Order.findById(orderId)
	.then((order) => {
		if (!order) {
			return next(new Error("No order found."));
		}
		if (order.user.userId.toString() !== req.user._id.toString()) {
			return next(new Error("Unauthorized"));
		}
			// console.log(orderId);
			const invoiceName = "invoice-" + orderId + ".pdf";			// console.log(invoiceName); 	
			const invoicePath = path.join("data", "invoices", invoiceName);

			const pdfDoc = new PDFDocument(); 	
			res.setHeader("Content-Type", "application/pdf");
			res.setHeader(
				"Content-Disposition",
				"inline; filename =" + invoiceName + ""
			); //attachment in place for inline for instant download
			pdfDoc.pipe(fs.createWriteStream(invoicePath));
			pdfDoc.pipe(res);

			// pdfDoc.text('Hello world');
			pdfDoc.fontSize(26).text("Invoice", {
				underline: true,
			});
			let totalPrice = 0;
			pdfDoc.text("--------------------------");
			order.products.forEach((prod) => {
				totalPrice += prod.quantity * prod.product.price;
				pdfDoc
					.fontSize(14)
					.text(
						prod.product.title +
							" - " +
							prod.quantity +
							" x " +
							"Rs." +
							prod.product.price
					);
			});
			pdfDoc.text("Total Price : Rs." + totalPrice);

			pdfDoc.end();
			//Normal data capture//
			// fs.readFile(invoicePath, (err, data) => {
			// 	if (err) {
			// 		next(err);
			// 	}
			// 	res.setHeader("Content-Type", "application/pdf");
			// 	res.setHeader(
			// 		"Content-Disposition",
			// 		"inline; filename =" + invoiceName + ""
			// 	); //attachment in place for inline for instant download
			// 	res.end(data);
			// });

			//stream data capture//
			// const file = fs.createReadStream(invoicePath);
			//setHeaders
			// file.pipe(res);
		})
		.catch((err) => {
			next(err);
		});
};
