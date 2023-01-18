const fs = require("fs");
const path = require("path");
const Product = require("../models/product");
const Order = require("../models/order");
const PDFDocument= require('pdfkit')

exports.getProducts = (req, res, next) => {
	Product.find()
		.then((products) => {
			console.log(products);
			res.render("shop/product-list", {
				prods: products,
				pageTitle: "All Products",
				path: "/products",
				isAuthenticated: req.session.isLoggedIn,
			});
		})
		.catch((err) => {
			console.log(err);
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
		.catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
	Product.find()
		.then((products) => {
			res.render("shop/index", {
				prods: products,
				pageTitle: "Shop",
				path: "/",
			});
		})
		.catch((err) => {
			console.log(err);
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
	Order.findById(orderId)
		.then((order) => {
			if (!order) {
				return next(new Error("No order found."));
			}
			if (order.user.userId.toString() !== req.user._id.toString()) {
				return next(new Error("Unauthorized"));
			}
			// console.log(orderId);
			const invoiceName = "invoice-" + orderId + ".pdf";
			// console.log(invoiceName);
			const invoicePath = path.join("data", "invoices", invoiceName);

			const pdfDoc= new PDFDocument();
			res.setHeader("Content-Type", "application/pdf");
			res.setHeader(
				"Content-Disposition",
				"inline; filename =" + invoiceName + ""
			); //attachment in place for inline for instant download
			pdfDoc.pipe(fs.createWriteStream(invoicePath))
			pdfDoc.pipe(res);

			// pdfDoc.text('Hello world');
			pdfDoc.fontSize(26).text('Invoice',{
				underline:true
			})
			let totalPrice=0;
			pdfDoc.text('--------------------------');
			order.products.forEach(prod=>{
				totaPrice=totalPrice+prod.quantity * prod.product
				pdfDoc.text(prod.product.title+' - '+prod.quantity+' x '+'₹'+prod.product.price)
			})


			pdfDoc.end()
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
