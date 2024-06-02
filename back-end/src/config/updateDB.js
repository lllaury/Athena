const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function addNewFieldToDocuments() {
    const updateResult = await prisma.task_data.updateMany({
        data: {
            running_time: 0, // Set a default value for the new field
            completion_time: 0,
        },
    });

    console.log(`${updateResult.count} documents updated.`);
}

addNewFieldToDocuments()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
