const exp = require('constants')
const express = require('express')
const path = require('path')
const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')))

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const key = '363cb9c719894ad78803af05bd166800'

const getWeatherData = (city) => {
    return new Promise((resolve, reject) =>{
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`
    fetch (url)
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        if (data.cod !== 200) {
            reject(data.message || "City not found");
        } else {
            let description = data.weather[0].description;
            let city = data.name;
            let temp = Math.round(parseFloat(data.main.temp) - 273.15);
            const result = {
                description: description,
                city: city,
                temp: temp,
                error: null,
            };
            resolve(result);
        }
    })
    .catch((error) => {
        reject(error);
    });
});
};
 
app.all ('/', (req, res) => {
    let city;
    let error = null;
    
    if (req.method === 'GET') {
        city = 'Tartu';
    } else if (req.method === 'POST') {
        city = req.body.cityname?.trim();   
        if (!city || city.length === 0) {
            error = 'input field is empty';
            res.render('index', { error });
            return; 
        }
    } else {
        city=req.body.cityname
    } 
    getWeatherData(city)
    .then ((data) =>{
        res.render('index', data)
    })
    .catch(error => {
        res.render('index', {
            error: 'Problem with getting data, please try again...'
        })
    })
})

app.listen(3002)
console.log('Server started on localhost:3002')
