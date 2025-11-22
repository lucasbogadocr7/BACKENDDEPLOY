import express from "express"

const pathHello = "/hello"

export default function helloRoutes() {
    const router = express.Router();

    //http://localhost:3000/hello
    router.get(pathHello, (req, res) => {
        res.json({ message: "hello world" })
    });

    return router;
}
