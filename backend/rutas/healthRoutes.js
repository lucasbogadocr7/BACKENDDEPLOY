import express from 'express'

const pathHealth = "/health"

export default function healthRoutes() {
    const router = express.Router();

    //http://localhost:3000/health
    router.get(pathHealth, (req, res) => {
        res.send("ok");
    });

    return router;
}


