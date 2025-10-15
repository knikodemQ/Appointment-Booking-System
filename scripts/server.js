const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, '../data/data.json')); 
const middlewares = jsonServer.defaults();


server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === 'POST') {
    const db = router.db; 
    const tableName = req.path.split('/')[1];
    const table = db.get(tableName);
    if (table && table.value().length > 0) {
      const lastId = table.value().slice(-1)[0].id || 0;
      req.body.id = (typeof lastId === 'number') ? lastId + 1 : lastId; 
    } else {
      req.body.id = 1;
    }
  }
  next();
});

server.use(middlewares);
server.use(router);


server.listen(3000, () => {
  console.log('JSON Server is running on http://localhost:3000');
});
