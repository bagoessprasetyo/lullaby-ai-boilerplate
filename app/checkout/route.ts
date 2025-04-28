// import { env } from "@/env";
import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
	accessToken: 'polar_oat_HQfOno7PvaedkKPjPuHBu5PxNCbzleSuAYlL50QCnmj',
	server: "sandbox", // Use sandbox for testing purposes - otherwise use 'production' or omit this line
	successUrl: `http://localhost:3000/confirmation`,
    includeCheckoutId: true
})