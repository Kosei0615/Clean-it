import express from 'express';
import { json } from 'body-parser';
import { setRoutes as setFrontDeskRoutes } from './routes/frontDesk';
import { setRoutes as setHousekeepingRoutes } from './routes/housekeeping';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(json());

setFrontDeskRoutes(app);
setHousekeepingRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});