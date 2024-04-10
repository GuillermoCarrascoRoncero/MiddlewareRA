var express = require('express');
var router = express.Router();
var fs = require('fs');
var mqtt = require('mqtt');
var crate = require('node-crate');

const mqttClient = mqtt.connect('mqtt://localhost'); 

crate.connect('localhost', 4200);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Data-Logger' });
});

router.get('/record', function(req, res, next) {
	var now = new Date();
var logfile_name = __dirname+'/../public/logs/' +req.query.id_nodo+ "-"+ now.getFullYear() + "-"+ now.getMonth() + "-" + now.getDate() +'.csv'

  const data = req.query;
  
  crate.execute("INSERT INTO ra_table (id_nodo, time, temperatura, humedad, co2, volatiles) VALUES (?, ?, ?, ?, ?, ?)", [data.id_nodo, now.getTime(), data.temperatura, data.humedad, data.co2, data.volatiles])
    .then((result) => {
      console.log('Datos enviados a la DB:', result);
    })
    .catch((error) => {
      console.error('Error al enviar datos:', error);
    });
	
	mqttClient.publish('sensor-topic', JSON.stringify(req.query));

	fs.stat(logfile_name, function(err, stat) {
		if(err == null) {
			console.log('File %s exists', logfile_name);
			let content = req.query.id_nodo+';'+now.getTime()+";"+req.query.temperatura+";"+req.query.humedad+";"+req.query.co2+";"+req.query.volatiles+"\r\n";
			append2file(logfile_name, content);
			
		} else if(err.code === 'ENOENT') {
			// file does not exist
			let content ='id_nodo; timestamp; temperatura; humedad; CO2; volatiles\r\n'+req.query.id_nodo+';'+now.getTime()+";"+req.query.temperatura+";"+req.query.humedad+";"+req.query.co2+";"+req.query.volatiles+"\r\n";
		   append2file(logfile_name, content);
		} else {
			console.log('Some other error: ', err.code);
		}
	});

   //res.render('index', { title: 'Express' });
   res.send("Saving: "+req.query.id_nodo+';'+now.getTime()+";"+req.query.temperatura+";"+req.query.humedad+";"+req.query.co2+";"+req.query.volatiles+" in: "+logfile_name);
});

// POST handler
router.post('/record', function(req, res, next) {
  const data = req.body;
  var now = new Date();
  
  crate.execute("INSERT INTO ra_table (id_nodo, time, temperatura, humedad, co2, volatiles) VALUES (?, ?, ?, ?, ?, ?)", [data.id_nodo, now.getTime(), data.temperatura, data.humedad, data.co2, data.volatiles])
    .then((result) => {
      console.log('Datos enviados a la DB:', result);
    })
    .catch((error) => {
      console.error('Error al enviar datos:', error);
    });
	
  mqttClient.publish('sensor-topic', JSON.stringify(data));
  res.sendStatus(200);
});

function append2file (file2append, content){
	fs.appendFile(file2append, content, function (err) {
    if (err) throw err;
    console.log("Saving: "+content+" in: "+file2append);
});
}

module.exports = router;
