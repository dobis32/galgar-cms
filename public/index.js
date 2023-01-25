export {};
// const main = async () => {
//     const __filename = fileURLToPath(import.meta.url);
//     const __dirname = dirname(__filename);
//     const port = process.env.PORT || 3001;
//     const app = express();
//     const publicDirectoryPath = path.join(__dirname, '../public');
//     app.use(express.json({ limit: '50mb' }));
//     app.use(express.urlencoded({ extended: true, limit: '50mb' }));
//     app.use(express.static(publicDirectoryPath));
//     app.use(galgarRouter);
//     app.listen(port, () => {
//         console.log('Server is up on port ' + port);
//     });
// };
// main();
