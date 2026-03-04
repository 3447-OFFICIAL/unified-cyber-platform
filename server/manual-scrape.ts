import { startScheduler } from "./src/services/scheduler.service";

async function main() {
    console.log("Forcing an immediate manual scrape cycle for all regions...");
    startScheduler(); // this initializes cron

    // the startScheduler also does an initial fetch on boot
    // Allow it to run for 20 seconds then exit to populate
    setTimeout(() => {
        console.log("Exiting manual scrape.");
        process.exit(0);
    }, 20000);
}

main();
