import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";


const main = async () => {
    try {
        await prisma.$connect()
        console.log("Connected to the database successfully")
        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`)
        })
    } catch (error) {
        console.log(error)
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();