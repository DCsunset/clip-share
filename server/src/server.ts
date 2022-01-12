import Fastify from "fastify";

const fastify = Fastify({
	logger: true
});

fastify.get("/", async () => {
	return { hello: "world" };
});

const start = async () => {
	const isProduction = process.env.NODE_ENV === "production";
	const address = isProduction ? "0.0.0.0" : "localhost";

	try {
		await fastify.listen(3000, address);
	}
	catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();

